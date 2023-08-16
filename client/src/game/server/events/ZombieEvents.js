import * as THREE from "three";
import Zombie from "../../mob/Zombie.js";
import Utils from "../../Utils";

export default class ZombieEvents {

    constructor({engine, socket}) {
        this.engine = engine
        this.socket = socket
    }

    bind() {
        // get players position (update game state)
        this.socket.on('zombies_positions', (zombieList) => {
            Utils.dispatchEventTo('positions', {zombies: zombieList}, this.engine.zombieManager)
        })

        // on zombie death
        this.socket.on('zombie_death', (zombie) => {
            Utils.dispatchEventTo('kill', {zombie: zombie}, this.engine.zombieManager)
        })
    }

}