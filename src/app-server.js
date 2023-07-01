import Server from "./server/Server.js";

global.ZombieServer = new Server({
    online: true,
    database: {
        name: 'mongo'
    }
})
ZombieServer.run()