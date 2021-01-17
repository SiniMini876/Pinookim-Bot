let allowedRestart = [
	'474584102335676427', //Sini
	'472071709722411026', //Ari
	'752139100340879460', //Adi Shtraus
	'315849563594293259', // Erez
	'627029564224438274', //Amit
	'451819243248418847', //Uri
	'256453875635191810', //Ido
	'494772294510575616', //Omri
	'741699710674272327', //Kfir The King
	'487702977000243212', //Adi Hadevber
	'594184772453007382', //Tamir

]

module.exports = {
	name: "restart",
	aliases: "res",
	cooldown: 10,
	description: "restart what the fuck did you think it do!!?!??!?",
	execute: async(message, args, client) => {

		const Sini = message.guild.members.cache.find(m => m.id === "474584102335676427")

		if(!allowedRestart.includes(message.author.id)) return message.reply("אין לך הרשאה כפרע, תנסה לבדוק אם סיני המלך שכח אותך או שלא חושב שאתה מגניב. תנסה לדבר איתו: " + '<@474584102335676427>')
		const queue = message.client.queue.get(message.guild.id);
		if(queue) queue.clear();
		console.log("Queue has been cleared!")
		client.destroy();
		console.log("The bot has been disconnected!")
		client.login(process.env.TOKEN);
		console.log("The bot has been reconnected!")
		message.channel.send("חזרתי מהכלא!")

	}
}