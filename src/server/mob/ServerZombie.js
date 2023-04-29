import * as THREE from "three";
import Utils from "../../common/Utils.js";
import MovementManager from "../../common/MovementManager.js";

export default class ServerZombie {

    constructor(id, roomId) {
        this.id = id
        this.roomId = roomId

        this.movementManager = new MovementManager({host: this})

        this.spawners = [
            new THREE.Vector3(-27.8, 0, -16),
            new THREE.Vector3(-4, 0, 29),
        ]

        this.position = new THREE.Vector3()
        this.position.copy(this.spawners[Math.floor(Math.random() * this.spawners.length)])

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

    repulseOtherZombies() {
        for (const [id, zombie] of ZombieServer.GAMES.get(this.roomId).ZOMBIES) {
            const distance = zombie.position.manhattanDistanceTo(this.position)
            if (distance < .8) {
                this.movementManager.flee(zombie.position)
            }
        }
    }

}