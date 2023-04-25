import * as THREE from "three";
import Utils from "../../common/Utils.js";

export default class Zombie {

    constructor(id, roomId) {
        this.id = id
        this.roomId = roomId

        this.position = new THREE.Vector3(0, 0, 0)
        this.position.set(0, 0, 0)
        this.direction = new THREE.Vector3(0, 0, 0)
        this.color = Utils.randomColor()

        this.speed = 5
    }

    moveToClosestPlayer() {
        for (const [key, val] of ZombieServer.GAMES.get(this.roomId).PLAYERS) {
            this.position.addScaledVector(this.position.clone().add(val.position) - val.position, this.speed)
        }
    }

}