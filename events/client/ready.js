const express = require('express');
const app = express();
const port = 3000;

module.exports = (Discord, client) => {

    app.get('/', (req, res) => res.send('PinookimBot is Active!'));

    app.listen(port, () => console.log(`PinookimBot is Active and lisening on port ${port}`));

    client.user.setActivity(`משתהה בכלא`, { type : "PLAYING" });
}