const express = require('express');
const app = express();
const port = 3000;
const wokcommands = require("wokcommands");
let demoServerID = '720226309267259432';
let buganimServerID ="693864294911049829";

module.exports = (Discord, client) => {
    const getApp = (guildID) => {
        const app = client.api.applications(client.user.id);
        if (guildID) {
            app.guilds(guildID);
        }
        return app;
    };

    new wokcommands(client, {
        commandsDir: 'slashCommands',
        testServers: [demoServerID, buganimServerID],
        showWarns: false,
    });

    app.get('/', (req, res) => res.send('PinookimBot is Active!'));

    app.listen(port, () => console.log(`PinookimBot is Active and lisening on port ${port}`));

    client.user.setActivity(`משתהה בכלא`, { type : "PLAYING" });
}