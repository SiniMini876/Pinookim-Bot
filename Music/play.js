/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
const emotes = require ('../../config/emojis.json');
const Discord = require('discord.js');

module.exports = {
	name: 'play',
	aliases: ['p'],
	category: 'Music',
	description: 'Play music.',
	usage: 'play <song-name>',
	run: async (client, message, args) => {
		return client.player.play(message, args[0], message.member.user);
		// If the member is not in a voice channel
		if(!message.member.voice.channel) return message.channel.send(`You're not in a voice channel ${emotes.error}`);

		// If no music is provided
		if (!args[0]) return message.channel.send(`Please enter a music ${emotes.error}`);

		const aTrackIsAlreadyPlaying = client.player.isPlaying(message.guild.id);

		// If there's already a track playing
		if(aTrackIsAlreadyPlaying) {

			// Add the track to the queue
			const result = await client.player.addToQueue(message.guild.id, args[0]);
			if(!result) return message.channel.send('This song provider is not supported...');

			if(result.type === 'playlist') {
				message.channel.send(`${result.tracks.length} songs added to the queue ${emotes.music}`);
			}
			else {
				message.channel.send(`${result.name} added to the queue ${emotes.music}`);
			}

		}
		else {

			// Else, play the song
			const result = await client.player.play(message, args.join(' ')).catch(() => {});
			if(!result) return message.channel.send('This song provider is not supported...');

			if(result.type === 'playlist') {
				message.channel.send(`${result.tracks.length} songs added to the queue ${emotes.music}\nCurrently playing ${result.tracks[0].name} !`);
			}
			else {
				message.channel.send(`Currently playing ${result.name} ${emotes.music}`);
			}

			const queue = client.player.getQueue(message.guild.id)

			// Events
				.on('end', () => {
					message.channel.send(`There is no more music in the queue ${emotes.error}`);
				})
				.on('trackChanged', (oldTrack, newTrack) => {
					message.channel.send(`Now playing ${newTrack.name} ... ${emotes.music}`);
				})
				.on('channelEmpty', () => {
					message.channel.send(`Stop playing, there is no more member in the voice channel ${emotes.error}`);
				});
		}
	},
};