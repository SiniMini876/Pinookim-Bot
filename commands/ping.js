module.exports = {
    name: 'ping',
    aliases: ['pong'],
    cooldown: 3,
    description: "pinging the bot, shows latency",
    async execute(message, args, client, Discord) {
        const msg = await message.channel.send('🏓 Pinging...');

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.COLOR)
			.setTitle('🏓 Pong!')
			.setDescription(`Bot Latency is **${Math.floor(msg.createdTimestamp - message.createdTimestamp)} ms** \nAPI Latency is **${Math.round(client.ws.ping)} ms**`);

		message.channel.send(embed);
    }
}