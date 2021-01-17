const fs = require("fs")

module.exports = (Discord, client) => {
    const command_files = fs.readdirSync('./commands/').filter(file => file.endsWith(".js"));

    for(const file of command_files){
        const command = require(`../commands/${file}`);
        if(command.name){
            client.commands.set(command.name, command);
        }
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
                return client.aliases.set(alias.name, command);
            })
        } else {
            continue;
        }
    }
}