const fs = require("fs");

module.exports = (Discord, client) => {
    const command_files = fs.readdirSync("./src/commands/").filter((file) => file.endsWith(".js"));

    for (const file of command_files) {
        const command = require(`../commands/${file}`);
        if (command.name) {
            console.log(`Loaded ${command.name} command`);
            client.commands.set(command.name, command);
        } else {
            continue;
        }
    }
};
