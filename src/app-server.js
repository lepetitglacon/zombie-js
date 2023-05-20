import ZombieGameServer from "./server/ZombieGameServer.js";

global.ZombieServer = new ZombieGameServer()
ZombieServer.run()