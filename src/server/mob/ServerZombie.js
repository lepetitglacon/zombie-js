import * as THREE from "three";
import Utils from "../../common/Utils.js";

export default class ServerZombie {

    constructor(id, roomId) {
        this.id = id
        this.roomId = roomId

        this.position = new THREE.Vector3(0, 0, 0)
        this.position.set(Utils.getRandomInt(-15,15), 0, Utils.getRandomInt(-15,15))
        this.direction = new THREE.Vector3(Utils.getRandomInt(-15,15), 0, Utils.getRandomInt(-15,15))
        this.color = Utils.randomColor()

        this.lastPosition = new THREE.Vector3(0, 0, 0)
        this.lastDirection = new THREE.Vector3(0, 0, 0)

        this.speed = 5
        this.health = 100
    }

    moveToClosestPlayer() {
        for (const [key, val] of ZombieServer.GAMES.get(this.roomId).PLAYERS) {
            // this.position.addScaledVector(this.position.clone().add(val.position) - val.position, this.speed)
        }
    }

}