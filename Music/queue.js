/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-unused-vars */
const emotes = require ('../../config/emojis.json');
const Discord = require('discord.js');

module.exports = {
	name: 'queue',
	aliases: ['q'],
	category: 'Music',
	description: 'Shows the songs queue',
	usage: 'queue',
	run: async (client, message, args) => {

		// If the member is not in a voice channel
		if(!message.member.voice.channel) return message.channel.send(`You're not in a voice channel ${emotes.error}`);

		// Get queue
		const queue = client.player.getQueue(message.guild.id);

		// If there's no music
		if(!queue) return message.channel.send(`No songs currently playing ${emotes.error}`);

		// Message
		message.channel.send(`**Server queue ${emotes.queue}**\nCurrent - ${queue.playing.name} | ${queue.playing.author}\n` +
    (
    	queue.tracks.map((track, i) => {
    		return `#${i + 1} - ${track.name} | ${track.author}`;
    	}).join('\n')
    ));

	},
};
