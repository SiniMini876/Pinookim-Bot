require("dotenv").config();

module.exports = (Discord, client, message) => {
    if(!message.content.startsWith(client.prefix) || message.author.bot) return;
    
    const args = message.content.slice(client.prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd)
    || client.commands.find(cd => cd.aliases && cd.aliases.includes(cmd));

    const cooldowns = client.cooldowns;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
        }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name || command.aliases);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(
            `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
                );
            }
        }
    
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
    try {    
        command.execute(message, args, client, Discord)
    } catch(err) {
        console.log(err)
        return message.channel.send(` הייתה בעיה לבצע את הפקודה, אם תקלה זו חוזרת אנא פנה לסיני הגדול ` + '<@474584102335676427>')
    }
}