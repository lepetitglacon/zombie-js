import g from "three/addons/libs/lil-gui.module.min.js";

export default class DoorManager extends EventTarget{

    constructor({game}) {
        super()
        this.game = game

        this.timeToOpen = 2000 // ms

        this.DOORS = new Map()

        this.bind()
    }

    addDoor(mesh) {
        const door = new Door(mesh)
        this.DOORS.set(door.id, door)
    }

    bind() {
        this.addEventListener('player_trying_to_open_door', (e) => {
            if (!this.DOORS.has(e.doorId)) return console.log('door not found')
            if (!this.game.PLAYERS.has(e.userId)) return console.log('player not found')

            const door = this.DOORS.get(e.doorId)
            const player = this.game.PLAYERS.get(e.userId)

            console.log(player.points)
            console.log(door.price)

            if (player.points >= door.price) {
                console.log('player bought door')

                player.points -= door.price

                // TODO send player points info
                this.game.io.to(this.game.gameId).emit('game:player:update_point')

                // TODO add new spawners to ZombieFactory for each rooms
                this.game.zombieFactory.makeSpawnersAvailableForRooms(door.rooms)

                console.log(`[DOORS] ${e.doorId} opened`)
                this.game.io.to(this.game.gameId).emit('game:door:before_open', {
                    doorId: e.doorId
                })

                setTimeout(() => {
                    this.game.io.to(this.game.gameId).emit('game:door:open', {
                        doorId: e.doorId
                    })
                    door.isOpen = true
                    // this.game.DOORS.delete(e.doorId)
                }, this.timeToOpen)
            } else {
                console.log('player cant afford door')
            }

        })
    }
}

class Door {

    static idCounter = 0

    constructor(mesh) {
        this.id = Door.idCounter++

        this.mesh = mesh
        this.rooms = mesh.userData.RoomIds
        this.price = mesh.userData.Price
        this.name = mesh.name
        this.position = mesh.position
    }
}