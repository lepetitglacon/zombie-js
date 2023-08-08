import ServerZombie from "./Zombie.js";
import Zombie from "../../../../src/client/mob/Zombie.js";
import * as THREE from "three";

export default class ZombieFactory {
    static id = 0
    static spawners = [
        new THREE.Vector3(-27.8, 0, -16)
    ]

    constructor() {

    }

    static createClientZombie(zombie) {
        return
    }

    static createServerZombie(roomId) {
        return new ServerZombie({id: this.id++, roomId: roomId, position: this.spawners[Math.floor(Math.random() * this.spawners.length)]})
    }

}