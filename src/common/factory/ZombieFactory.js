import ServerZombie from "../../server/service/mob/ServerZombie.js";
import ClientZombie from "../../client/mob/ClientZombie.js";
import * as THREE from "three";

export default class ZombieFactory {
    static id = 0
    static spawners = [
        new THREE.Vector3(-27.8, 0, -16)
    ]

    constructor() {

    }

    static createClientZombie(zombie) {
        return new ClientZombie(zombie)
    }

    static createServerZombie(roomId) {
        return new ServerZombie({id: this.id++, roomId: roomId, position: this.spawners[Math.floor(Math.random() * this.spawners.length)]})
    }

}