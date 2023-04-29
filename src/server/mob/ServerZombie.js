import * as THREE from "three";
import Utils from "../../common/Utils.js";
import MovementManager from "../../common/MovementManager.js";

export default class ServerZombie {

    constructor(id, roomId) {
        this.id = id
        this.roomId = roomId

        this.movementManager = new MovementManager({host: this})

        this.position = new THREE.Vector3()
        this.position.set(Utils.getRandomInt(-15,15), 0, Utils.getRandomInt(-15,15))

        this.velocity = new THREE.Vector3()

        this.direction = new THREE.Vector3(Utils.getRandomInt(-15,15), 0, Utils.getRandomInt(-15,15))
        this.color = Utils.randomColor()

        this.lastPosition = new THREE.Vector3(0, 0, 0)
        this.lastDirection = new THREE.Vector3(0, 0, 0)

        this.speed = 0.02 // dm/s
        this.health = 100
    }

    moveToClosestPlayer() {

        let closest = undefined
        let closestDistance = 999999999999
        for (const [id, player] of ZombieServer.GAMES.get(this.roomId).PLAYERS) {
            const distance = player.position.manhattanDistanceTo(this.position)
            if (distance < closestDistance) {
                closest = player
                closestDistance = distance
            }
        }
        if (closest !== undefined) {
            this.movementManager.seek(closest.position)
        }
    }

}