import * as THREE from "three";
import Utils from "../../../Utils.js";
import MovementManager from "./MovementManager.js";

export default class Zombie {

    constructor({id, game, position}) {
        this.id = id
        this.game = game

        this.movementManager = new MovementManager({host: this})

        this.position = new THREE.Vector3()
        this.position.copy(position)

        this.velocity = new THREE.Vector3()

        this.direction = new THREE.Vector3(Utils.getRandomInt(-15,15), 0, Utils.getRandomInt(-15,15))
        this.color = Utils.randomColor()

        this.lastPosition = new THREE.Vector3(0, 0, 0)
        this.lastDirection = new THREE.Vector3(0, 0, 0)

        this.speed = 0.01 // dm/s
        this.health = 100
    }

    moveToClosestPlayer() {
        let closest = undefined
        let closestDistance = 999999999999

        for (const [id, player] of this.game.PLAYERS) {
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
        for (const [id, zombie] of ZombieServer.GAMES.get(this.gameId).ZOMBIES) {
            const distance = zombie.position.manhattanDistanceTo(this.position)
            if (distance < .8) {
                this.movementManager.flee(zombie.position)
            }
        }
    }

}