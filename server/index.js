import Server from "./Server.js";

global.ZombieServer = new Server({
    online: true,
    database: {
        name: 'mongo'
    }
})
ZombieServer.run()