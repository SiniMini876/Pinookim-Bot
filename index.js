const Discord = require("discord.js");
const { Client, Util, MessageEmbed, MessageAttachment, MessageMentions } = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const dotenv = require("dotenv").config();
const TOKEN = process.env.BOT_TOKEN;
const GOOGLE_API_KEY = process.env.YTAPI_KEY;
const PREFIX = process.env.PREFIX;
const cooldown = new Set();
const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map();
const bot = new Client({
  disableMentions: "all"});
require("./server.js");

bot.on("warn", console.warn);
bot.on("error", console.error);
bot.on("ready", () =>
  console.log(`${bot.user.tag} has been successfully turned on!`)
);

bot.on('ready', () => {
    console.log('This bot is active!');
})

bot.on("shardDisconnect", (event, id) =>
  console.log(
    `Shard ${id} disconnected (${event.code}) ${event}, trying to reconnect!`
  )
);
bot.on("shardReconnecting", id => console.log(`Shard ${id} reconnecting...`));

bot.on("message", async msg => {
  // eslint-disable-line
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.split(" ");
  const searchString = args.slice(1).join(" ");
  const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
  const serverQueue = queue.get(msg.guild.id);

  let command = msg.content.toLowerCase().split(" ")[0];
  command = command.slice(PREFIX.length);
  if(command === 'test') return msg.channel.send('Test!').then(m => m.delete({ timeout: 5000 }));

  if(command === 'setstatus'){
    if(!args[1]) return msg.channel.send('אתה חייב להחליט על מה אני אעשה, תנסה PLAYING STREAMING LISTENING');
    if(!args[2]) return msg.channel.send('לא החלטת על קישור, אם אתה בחרת לא בסוג STREAMING פשוט תכתוב משו')
    try{
      var content = msg.content.indexOf('?');
      var cont = args.join(content + 1);
      if(!args.join(content + 1)) return msg.channel.send('לא החלטת על סטאטוס שיהיה לי.');

      bot.user.setPresence({
        status: 'online',
        activity: {
          name: cont,
          type: args[0],
          url: args[1],
        },
      });
    }catch(err){
      msg.channel.send('ERR')
    }
  } 

  if (command === "restart") {
    if(!msg.member.voice.channel.id) return; 
    const voiceChannel = msg.member.voice.channel;
    if(!msg.member.roles.cache.find(r => r.name === 'DEV')) return;
    bot.destroy();
    bot.login(process.env.BOT_TOKEN);
    queue.delete(msg.guild.id);
    var connection = await voiceChannel.leave();
    msg.channel.send('עושה ריסטארט נשמה')
  }
  if (command === "play" || command === "p") {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel){
      return msg.channel.send(
        "תקשיב, אני צריך שתהיה בחדר שמע כדי שאשמיע לך. מה אני קוסם?"
      );msg.delete({ timeout: 5000 }).catch(console.error);}
      
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        "Sorry, but I need **`CONNECT`** permissions to proceed!"
      ); 
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        "Sorry, but I need **`SPEAK`** permissions to proceed!"
      );
    }msg.delete({ timeout: 5000 }).catch(console.error);
    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
        await (video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
      }
      return msg.channel.send(
        ` **|**  Playlist: **\`${playlist.title}\`** has been added to the queue!`
      );
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          var video = await youtube.getVideoByID(videos[0].id);
          if (!video)
            return msg.channel.send(
              "🆘  **|**  לא מצאתי כלום, תחפש משהו אחר כי אם לא אני אפליץ עליך"
            );
        } catch (err) {
          console.error(err);
          return msg.channel.send(
            "🆘  **|**  לא מצאתי כלום, תחפש משהו אחר כי אם לא אני אפליץ עליך"
          );
        }
      }
      handleVideo(video, msg, voiceChannel);

      setInterval( async () => {
        if(!voiceChannel.members.find(m => m.id === msg.member.id)){
          var connection = await voiceChannel.leave();
        }
      }, 5000)

      return msg.delete({ timeout: 5000 }).catch(console.error);
    }

  }
  if (command === "search" || command === "sc") {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
      return msg.channel.send(
        "תקשיב, אני צריך שתהיה בחדר שמע כדי שאשמיע לך. מה אני קוסם?"
      );msg.delete({ timeout: 5000 }).catch(console.error);
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        "Sorry, but I need **`CONNECT`** permissions to proceed!"
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        "Sorry, but I need **`SPEAK`** permissions to proceed!"
      );
    }
    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
        await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
      }
      return msg.channel.send(
        `<:yes:591629527571234819>  **|**  Playlist: **\`${playlist.title}\`** has been added to the queue!`
      );
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;
          msg.channel.send(`
__**Song selection**__

${videos.map(video2 => `**\`${++index}\`  |**  ${video2.title}`).join("\n")}

Please provide a value to select one of the search results ranging from 1-10.
					`);
          // eslint-disable-next-line max-depth
          try {
            var response = await msg.channel.awaitMessages(
              msg2 => msg2.content > 0 && msg2.content < 11,
              {
                max: 1,
                time: 10000,
                errors: ["time"]
              }
            );
          } catch (err) {
            console.error(err);
            msg.channel.send(
              "לא מצאתי מענה נכון לבחירת השיר, תנסה לחפש שוב"
            ); return msg.delete({ timeout: 5000 }).catch(console.error);
          }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          return msg.channel.send(
            "🆘  **|**  לא מצאתי תוצאות בחיפוש תנסה לחפש משהו אחר ינעל דינאק"
          ); 
        }
      }
      handleVideo(video, msg, voiceChannel);
      return msg.delete({ timeout: 5000 }).catch(console.error);
    }
  }
  else if (command === "skip") {
    if (!msg.member.voice.channel)
      return msg.channel.send(
        "תקשיב, אני צריך שתהיה בחדר שמע כדי שאמשימע לך. מה אני קוסם?"
      );msg.delete({ timeout: 5000 }).catch(console.error);
    if (!serverQueue)
      return msg.channel.send(
        "אין שום שיר שאני אוכל להעביר לך"
      );msg.delete({ timeout: 5000 }).catch(console.error);
    serverQueue.connection.dispatcher.end("Skip command has been used!");
    return msg.channel.send("⏭️  **|**  Skip command has been used!");
  }
  else if (command === "stop") {
    if (!msg.member.voice.channel)
      return msg.channel.send(
        "תקשיב, אני צריך שתהיה בחדר שמע כדי שאמשימע לך. מה אני קוסם?"
      );msg.delete({ timeout: 5000 }).catch(console.error);
    if (!serverQueue)
      return msg.channel.send(
        "אין שום שיר שאני אוכל להעביר לך"
      );msg.delete({ timeout: 5000 }).catch(console.error);
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end("Stop command has been used!");
    return msg.channel.send("⏹️  **|**  הפסקתי את השיר בשבילך, איזה גבר אני");
  } 
  else if (command === "volume" || command === "vol") {
    if (!msg.member.voice.channel)
      return msg.channel.send(
        "תקשיב, אני צריך שתהיה בחדר שמע כדי שאשנה לך את עוצמת השמע. מה אני קוסם?"
      );msg.delete({ timeout: 5000 }).catch(console.error);
    if (!serverQueue) return msg.channel.send("אין שום מוזיקה במתנגנת כרגע");
    if (!args[1])
      return msg.channel.send(
        `עוצמת השמע שלך כרגע היא: **\`${serverQueue.volume}%\`** אם ברצונך לשנות אותה תכתוב volume ואז את העוצמה שאתה רוצה )העוצמה נקבעת אך ורק מ1 ל100)`
      );
    if (isNaN(args[1]) || args[1] > 100)
      return msg.channel.send(
        "עוצמת שמע יכולה להיקבע רק על פי **1** - **100**"
      );
    serverQueue.volume = args[1];
    serverQueue.connection.dispatcher.setVolume(args[1] / 100);
    msg.channel.send(`I set the volume to: **\`${args[1]}%\`**`);
    return msg.delete({ timeout: 5000 }).catch(console.error);
  } 
  else if (command === "nowplaying" || command === "np") {
    if (!serverQueue) return msg.channel.send("אין שום מוזיקה מתנגנת כרגע");
    msg.channel.send(
      `🎶  **|**  Now Playing: **\`${serverQueue.songs[0].title}\`**`
    );
    return msg.delete({ timeout: 5000 }).catch(console.error);
  } 
  else if 
  (command === "queue" || command === "q") {
    if (!serverQueue) return msg.channel.send("אין שום מוזיקה מתנגנת כרגע");
    msg.channel.send(`
__**Song Queue**__

${serverQueue.songs.map(song => `**-** ${song.title}`).join("\n")}

**Now Playing: \`${serverQueue.songs[0].title}\`**
        `); return msg.delete({ timeout: 5000 }).catch(console.error);
  } 
  else if (command === "pause") {
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return msg.channel.send("⏸  **|**  הפסקתי את המוזיקה בשבילך, ידידי הצעיר");
    }
    msg.channel.send("אין שום מוזיקה מתנגנת כרגע");
    return msg.delete({ timeout: 5000 }).catch(console.error);
  } 
  else if (command === "resume") {
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return msg.channel.send("▶  **|**  הפעלתי את המוזיקה בשבילך, ידידי הצעיר");
    }
    msg.channel.send("אין שום מוזיקה מתנגנת כרגע");
    return msg.delete({ timeout: 5000 }).catch(console.error);
  } 
  else if (command === "loop") {
    if (serverQueue) {
      serverQueue.loop = !serverQueue.loop;
      return msg.channel.send(
        `:repeat: **|** Loop ${
          serverQueue.loop === true ? "enabled" : "disabled"
        }!`
      )
    }
    return msg.channel.send("אין שום מוזיקה מתנגנת כרגע");
    msg.delete({ timeout: 5000 }).catch(console.error);
  }
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id);
  const song = {
    id: video.id,
    title: Util.escapeMarkdown(video.title),
    url: `https://www.youtube.com/watch?v=${video.id}`
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 100,
      playing: true,
      loop: false
    };
    queue.set(msg.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(msg.guild, queueConstruct.songs[0], voiceChannel, msg);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      queue.delete(msg.guild.id);
      return msg.channel.send(
        `I could not join the voice channel: **\`${error}\`**`
      );
    }
  } else {
    serverQueue.songs.push(song);
    if (playlist) return;
    else
      return msg.channel.send(
        `<:yes:591629527571234819>  **|** **\`${song.title}\`** has been added to the queue!`
      );
  }

}

function play(guild, song, voiceChannel, msg) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    return queue.delete(guild.id);
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      const shiffed = serverQueue.songs.shift();
      if (serverQueue.loop === true) {
        serverQueue.songs.push(shiffed);
      }
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolume(serverQueue.volume / 100);

  serverQueue.textChannel.send({
    embed: {
    color: "RANDOM",
    description: `🎶  **|**  Start Playing: **\`${song.title}\`**`
    }
  });

  return setInterval( async () => {
    if(!voiceChannel.members.find(m => m.id === msg.member.id)){
      var connection = await voiceChannel.leave();
    }
  }, 5000)
}

bot.login(TOKEN);
