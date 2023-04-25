import Zombie from "../../server/mob/Zombie.js";

export default class ZombieFactory {
    static id = 0

    constructor() {

    }

    createZombie() {

    }

    static createClientZombie() {

    }

    static createServerZombie(roomId) {
        return new Zombie(this.id++, roomId)
    }

}