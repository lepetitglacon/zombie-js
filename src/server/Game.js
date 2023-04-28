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

        this.waveCount = 1

        this.maxZombiesAlive = 20
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

            // update ClientZombie movement
            for (const [id, zombie] of this.ZOMBIES) {
                if (zombie.health <= 0) {
                    console.log('zombie ' + id + ' is dead')
                    this.io.to(this.roomId).emit('zombie_death', id)
                    this.ZOMBIES.delete(id)
                }
            }

            if (this.zombieSpawnRateTime + this.zombieSpawnRate < Date.now() && this.ZOMBIES.size < this.maxZombiesAlive) {
                // console.log('spawned zombie ' + ZombieFactory.id + ' for game ' + this.roomId)
                this.ZOMBIES.set(ZombieFactory.id, ZombieFactory.createServerZombie(this.roomId))
                this.zombieSpawnRateTime = Date.now()
            }

            // update ClientZombie movement
            for (const [key, val] of this.ZOMBIES) {
                val.moveToClosestPlayer()
            }

            // emit players position to other players
            if (this.ZOMBIES.size > 0 && this.PLAYERS.size > 0) {
                const p = this.prepareZombiesToEmit()
                if (p.length > 0) {
                    this.io.to(this.roomId).emit('zombies_positions', p)
                }
            }

            // emit players position to other players
            if (this.PLAYERS.size > 1) {
                const p = this.preparePlayersToEmit()
                if (p.length > 0) {
                    this.io.to(this.roomId).emit('players_position', p)
                }
            }

        }, 1/this.tickRate*1000)
    }

    logPlayers() {
        console.log('[INFO] Online players : ' + this.PLAYERS.size)
    }

    preparePlayersToEmit(all) {
        let toSend = []
        let i = 0
        for (const [socket, socketHandler] of this.PLAYERS) {
            if (all !== undefined) {
                this.fillPlayerInfo(toSend, socketHandler, i)
                i++
            } else {
                if (!socketHandler.position.equals(socketHandler.lastPosition)) {
                    this.fillPlayerInfo(toSend, socketHandler, i)
                    i++
                }
            }

        }
        return toSend
    }

    fillPlayerInfo(toSend, socketHandler, i) {
        toSend[i] = {}
        toSend[i].socketId = socketHandler.socket.id
        toSend[i].username = socketHandler.username
        toSend[i].position = socketHandler.position
        toSend[i].direction = socketHandler.direction
        toSend[i].color = socketHandler.color
        socketHandler.lastPosition.copy(socketHandler.position)
    }

    prepareZombiesToEmit(all) {
        let toSend = []
        let i = 0
        for (const [id, zombie] of this.ZOMBIES) {
            if (all !== undefined) {
                this.fillZombieInfo(toSend, zombie, i)
                i++
            } else {
                if (!zombie.position.equals(zombie.lastPosition)) {
                    this.fillZombieInfo(toSend, zombie, i)
                    i++
                }
            }

        }

        return toSend
    }

    fillZombieInfo(toSend, zombie, i) {
        toSend[i] = {}
        toSend[i].id = zombie.id
        toSend[i].position = zombie.position
        toSend[i].direction = zombie.direction
        toSend[i].color = zombie.color
        zombie.lastPosition.copy(zombie.position)
    }

}