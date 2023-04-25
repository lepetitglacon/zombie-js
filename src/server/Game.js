import ZombieFactory from "../common/factory/ZombieFactory.js";

export default class Game {

    static STATUS = {
        PAUSED: 0,
        RUNNING: 1,
    }

    constructor(roomId, server) {
        this.io = server
        this.status = Game.STATUS.PAUSED
        this.roomId = roomId

        this.tickRate = 60
        this.prevTime = Date.now();

        this.zombieSpawnRate = 5000
        this.zombieSpawnRateTime = performance.now();

        this.name = ''

        this.PLAYERS = new Map()
        this.ZOMBIES = new Map()
    }

    run() {
        this.status = Game.STATUS.RUNNING

        // Game loop
        setInterval(() => {

            const time = Date.now();
            const delta = ( time - this.prevTime ) / 1000;

            if (this.zombieSpawnRateTime + this.zombieSpawnRate < Date.now()) {
                console.log('spawned zombie ' + ZombieFactory.id + ' for game ' + this.roomId)
                this.ZOMBIES.set(ZombieFactory.id, ZombieFactory.createServerZombie(this.roomId))
                this.zombieSpawnRateTime = Date.now()
            }

            // update Zombie movement
            for (const [key, val] of this.ZOMBIES) {
                val.moveToClosestPlayer()
            }

            if (this.ZOMBIES.size > 0 && this.PLAYERS.size > 0) {
                console.log('send zombies')
                this.io.to(this.roomId).emit('zombies_positions', this.prepareZombiesToEmit())
            }

            // emit players position to other players
            if (this.PLAYERS.size > 1) {
                this.io.to(this.roomId).emit('players_position', this.preparePlayersToEmit())
            }

        }, 1/this.tickRate*1000)
    }

    logPlayers() {
        console.log('[INFO] Online players : ' + this.PLAYERS.size)
    }

    preparePlayersToEmit() {
        let toSend = []
        let i = 0
        for (const [socket, socketHandler] of this.PLAYERS) {
            toSend[i] = {}
            toSend[i].socketId = socket.id
            toSend[i].position = socketHandler.position
            toSend[i].direction = socketHandler.direction
            toSend[i].color = socketHandler.color
            i++
        }
        return toSend
    }

    prepareZombiesToEmit() {
        let toSend = []
        let i = 0
        for (const [id, zombie] of this.ZOMBIES) {
            toSend[i] = {}
            toSend[i].id = zombie.id
            toSend[i].position = zombie.position
            toSend[i].direction = zombie.direction
            toSend[i].color = zombie.color
            i++
        }
        return toSend
    }

}