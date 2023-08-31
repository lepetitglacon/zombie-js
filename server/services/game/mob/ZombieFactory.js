import ServerZombie from "./Zombie.js";
import * as THREE from "three";
import {Vector3} from "three";

export default class ZombieFactory {

    constructor({game}) {
        this.game = game

        this.zombieCounterId = 0
        this.spawners = new Map([[-1, new Spawner({
            roomId: 0,
            position: new THREE.Vector3(-27.8, 0, -16),
            name: 'Default'
        })]])

        this.availableSpawners = new Map()

    }

    /**
     *
     * @returns {(number|Zombie)[]}
     */
    createServerZombie() {
        const newId = this.zombieCounterId++
        return [
            newId,
            new ServerZombie({
                id: newId,
                game: this.game,
                position: Array.from(this.availableSpawners.values())
                    [Math.floor(Math.random() * this.availableSpawners.size)].position
            })
        ]
    }

    /**
     *
     * @param roomId
     * @param position
     * @param name
     */
    setSpawner({roomId, position, name}) {
        const spawner = new Spawner({
            roomId,
            position,
            name
        })
        this.spawners.set(spawner.id, spawner)

        // set defaults spawners for room 0
        if (spawner.roomId === 0) {
            this.availableSpawners.set(spawner.id, spawner)
        }
    }

    makeSpawnersAvailableForRooms(roomsArray) {
        for (const [id, spawner] of this.spawners) {
            if (spawner.roomId in roomsArray && !this.availableSpawners.has(spawner.id)) {
                this.availableSpawners.set(spawner.id, spawner)
            }
        }
    }

}

class Spawner {

    static idCounter = 0

    constructor({roomId, position, name}) {
        this.id = Spawner.idCounter++

        this.roomId = roomId
        this.name = name
        this.position = position
    }

}