const Discord = require("discord.js");
require("dotenv").config();

let TOKEN, PREFIX;
try {
    const config = require("./config.json");
    TOKEN = config.TOKEN;
    PREFIX = config.PREFIX;
} catch (error) {
    TOKEN = process.env.TOKEN;
    PREFIX = process.env.PREFIX;
}

const client = new Discord.Client({ disableMentions: "everyone" });
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.queue = new Map();
client.prefix = PREFIX;

["event_handler", "command_handler"].forEach((handler) => {
    require(`./src/handlers/${handler}`)(Discord, client);
});

client.login(TOKEN);
