import ServerZombie from "../../server/mob/ServerZombie.js";
import ClientZombie from "../../client/mob/ClientZombie.js";

export default class ZombieFactory {
    static id = 0

    constructor() {

    }

    createZombie() {

    }

    static createClientZombie(zombie) {
        return new ClientZombie(zombie)
    }

    static createServerZombie(roomId) {
        return new ServerZombie(this.id++, roomId)
    }

}