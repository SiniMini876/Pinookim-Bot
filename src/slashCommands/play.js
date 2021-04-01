const { play } = require("./../Functions/playSlash");
const ytdl = require("ytdl-core");
const scdl = require("soundcloud-downloader");
const spotify = require("spotify-url-info");
const YTsearch = require("yt-search");
let YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
let SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

module.exports = {
    slash: true,
    description: "מנגן מוזיקה שאתה בוחר",
    minArgs: 1,
    testOnly: true,
    expectedArgs: "<search>",
    callback: async ({ message, args, text, client, prefix, instance, channel, interaction }) => {
        const createAPIMessage = async (Interaction, content) => {
            const { data, files } = await DiscordJS.APIMessage.create(
                client.channels.resolve(Interaction.channel_id),
                content
            )
                .resolveData()
                .resolveFiles();

            return { ...data, files };
        };

        const reply = async (Interaction, response) => {
            let data = {
                content: response
            };

            // Check for embeds
            if (typeof response === "object") {
                data = await createAPIMessage(Interaction, response);
            }

            client.api.interactions(Interaction.id, Interaction.token).callback.post({
                data: {
                    type: 4,
                    data
                }
            });
        };

        const member = channel.guild.members.cache.find((m) => m.id === interaction.member.user.id);
        const voiceChannel = member.voice.channel;

        const serverQueue = client.queue.get(channel.guild.id);
        if (!voiceChannel) return "You need to join a voice channel first!";

        if (serverQueue && voiceChannel !== channel.guild.me.voice.channel)
            return `You must be in the same channel as ${client.user}`;

        let [search] = args;
        const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
        const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
        const spotifyTrack = /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/;
        const urlValid = videoPattern.test(search);

        if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
            return client.commands.get("playlist").execute(client, interaction, channel, args);
        }

        const queueConstruct = {
            textChannel: channel,
            channel,
            connection: null,
            songs: [],
            loop: false,
            volume: 100,
            playing: true
        };

        let songInfo = null;
        let song = null;

        if (urlValid) {
            try {
                songInfo = await ytdl.getInfo(search);
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    duration: songInfo.videoDetails.lengthSeconds
                };
            } catch (error) {
                console.error(error);
                return error.message;
            }
        } else if (scRegex.test(search)) {
            try {
                const trackInfo = await scdl.getInfo(search, SOUNDCLOUD_CLIENT_ID);
                song = {
                    title: trackInfo.title,
                    url: trackInfo.permalink_url,
                    duration: Math.ceil(trackInfo.duration / 1000)
                };
            } catch (error) {
                if (error.statusCode === 404) return "Could not find that Soundcloud track.";
                return "There was an error playing that Soundcloud track.";
            }
        } else if (spotifyTrack.test(search)) {
            try {
                const trakInfo = await spotify.getPreview(search);
                const track = await YTsearch.search(trakInfo.title);
                const songInfo = await ytdl.getInfo(track.videos[0].url);
                song = {
                    title: songInfo.title,
                    url: songInfo.link,
                    audio: songInfo.audio
                };
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                const results = await YTsearch.search(search);
                songInfo = await ytdl.getInfo(results.videos[0].url);
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    duration: songInfo.videoDetails.lengthSeconds
                };
            } catch (error) {
                console.error(error);
                return "No video was found with a matching title";
            }
        }

        if (serverQueue) {
            serverQueue.songs.push(song);
            return `✅ **${song.title}** has been added to the queue by ${member}`;
        }

        queueConstruct.songs.push(song);
        client.queue.set(channel.guild.id, queueConstruct);

        try {
            queueConstruct.connection = await voiceChannel.join();
            await queueConstruct.connection.voice.setSelfDeaf(true);
            play(queueConstruct.songs[0], client, interaction, channel);
        } catch (error) {
            console.error(error);
            client.queue.delete(channel.guild.id);
            await voiceChannel.leave();
            return `Could not join the channel: ${error}`;
        }
    }
};
