import ServerZombie from "./Zombie.js";
import * as THREE from "three";

export default class ZombieFactory {
    static id = 0
    static spawners = [
        new THREE.Vector3(-27.8, 0, -16)
    ]

    static createServerZombie({game}) {
        return new ServerZombie({id: this.id++, game: game, position: this.spawners[Math.floor(Math.random() * this.spawners.length)]})
    }

}