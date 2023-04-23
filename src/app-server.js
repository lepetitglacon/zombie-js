import ZombieGameServer from "./server/ZombieGameServer.js";

global.ZombieServer = new ZombieGameServer()
ZombieServer.init()
ZombieServer.run()