/* eslint-disable no-unused-vars */
const emotes = require ('../../config/emojis.json');
const Discord = require('discord.js');

module.exports = {
	name: 'skip',
	category: 'Music',
	description: 'Skips the current song to the next in the queue.',
	usage: 'skip',
	run: async (client, message, args) => {

		// If the member is not in a voice channel
		if(!message.member.voice.channel) return message.channel.send(`You're not in a voice channel ${emotes.error}`);

		// If there's no music
		if(!client.player.isPlaying(message.guild.id)) return message.channel.send(`No music playing on this server ${emotes.error}`);
		try {
			const track = await client.player.skip(message.guild.id);

			// Message
			message.channel.send(`Song ${track.name} skipped ${emotes.success}`);
		}
		catch(err) { console.error(err); }


	},
};