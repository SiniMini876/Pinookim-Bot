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
const { Player } = require("discord-player");
const player = new Player(bot);
bot.player = player;
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

  if (command === "restart") {

    let restartPermission = ['474584102335676427', '256453875635191810', '315849563594293259', '627029564224438274', '741699710674272327', '472071709722411026', '752139100340879460', '487702977000243212', '451819243248418847', '594184772453007382']

    if(!msg.member.voice.channel.id) return; 
    const voiceChannel = msg.member.voice.channel;
    if(!restartPermission.includes(msg.member.id)) return msg.channel.send('תשמע אחי אין לך הרשאה לעשות ריסטארט מסיני המלך יש מצב שהוא שכח לתת לך, בכל מקרה תפנה לסיני המזניב').then(m => msg.delete({timeout: 5000}))
    bot.destroy();
    bot.login(process.env.BOT_TOKEN);
    queue.delete(msg.guild.id);
    var connection = await voiceChannel.leave();
    msg.channel.send('עושה ריסטארט נשמה')
  }
  if (command === "play" || command === "p") {
    player.play(msg, args[0], msg.member.user)
  }
  else if (command === "skip") {
    const skip = require('./Music/skip');
    skip.run(bot, msg, args)
  }
  else if (command === "stop") {
    const stop = require('./Music/stop');
    stop.run(bot, msg, args)
  } 
  else if 
  (command === "queue" || command === "q") {
    const queue = require('./Music/queue');
    queue.run(bot, msg, args)
  } 
  else if (command === "pause") {
    const pause = require('./Music/pause');
    pause.run(bot, msg, args)
  } 
  else if (command === "resume") {
    const resume = require('./Music/resume');
    resume.run(bot, msg, args)
  } 
  else if (command === "loop") {
    const loop = require('./Music/loop');
    loop.run(bot, msg, args)
  }
  else if (command === "vol") {
    const volume = require('./Music/volume');
    volume.run(bot, msg, args)
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
      play(msg.guild, queueConstruct.songs[0]);
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
  return;
}

function play(guild, song) {
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
}

bot.login(TOKEN);