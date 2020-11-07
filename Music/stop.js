/* eslint-disable no-unused-vars */
const emotes = require ('../../config/emojis.json');
const Discord = require('discord.js');

module.exports = {
	name: 'stop',
	category: 'Music',
	description: 'Stops the music that playing ',
	usage: 'stop',
	run: async (client, message, args) => {

		// If the member is not in a voice channel
		if(!message.member.voice.channel) return message.channel.send(`You're not in a voice channel ${emotes.error}`);

		// If there's no music
		if(!client.player.isPlaying(message.guild.id)) return message.channel.send(`No music playing on this server ${emotes.error}`);

		// Stop player
		client.player.stop(message.guild.id);

		// Message
		message.channel.send(`Music stopped ${emotes.success}`);

	},
};