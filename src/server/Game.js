import WaveHandler from "./Wave/WaveHandler.js";
import fs from "fs";
import ZombieFactory from "../common/factory/ZombieFactory.js";
import NodeThreeExporter from "@injectit/threejs-nodejs-exporters";

export default class Game {

    static STATUS = {
        PAUSED: 0,
        RUNNING: 1,
    }

    constructor(props) {
        this.io = props.server
        this.status = Game.STATUS.PAUSED
        this.private = false
        this.roomId = props.roomId

        this.tickRate = 60
        this.prevTime = Date.now();

        this.name = ''
        this.mapName = props.map
        this.map = undefined

        this.loader = new NodeThreeExporter()
        this.parseMap()

        this.PLAYERS = new Map()
        this.ZOMBIES = new Map()
        this.DOORS = new Map()
        this.MESSAGES = []

        this.waveHandler = new WaveHandler({game: this})
    }

    run() {
        this.status = Game.STATUS.RUNNING

        // Game loop
        setInterval(() => {

            const time = Date.now();
            const delta = ( time - this.prevTime ) / 1000;

            if (this.PLAYERS.size > 0) {

                // update ClientZombie life
                for (const [id, zombie] of this.ZOMBIES) {
                    if (zombie.health <= 0) {
                        this.io.to(this.roomId).emit('zombie_death', id)
                        this.ZOMBIES.delete(id)
                        this.waveHandler.killedZombies++
                    }
                }

                // spawn zombies
                this.waveHandler.update()

                // update ClientZombie movement
                for (const [key, zombie] of this.ZOMBIES) {
                    zombie.moveToClosestPlayer()
                    zombie.repulseOtherZombies()
                    zombie.movementManager.update()
                }

                // emit players position to other players
                if (this.ZOMBIES.size > 0) {
                    const p = this.prepareZombiesToEmit()
                    if (p.length > 0) {
                        this.io.to(this.roomId).emit('zombies_positions', p)
                    }
                }

                // emit players position to other players
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

    preparePoints() {
        const points = []
        for (const [socket, player] of this.PLAYERS) {
            points.push({
                player: socket.id,
                playerName: player.username ?? '',
                points:player.points})
        }
        return points
    }

    parseMap() {
        const file = fs.readFileSync('./src/client/assets/gltf/maps/' + this.mapName)

        this.loader.parse('glb', file,
            (gltf) => {

                for (const mesh of gltf.scene.children) {
                    switch (mesh.userData.type) {
                        case 'Ground':
                            break;

                        case 'Building':
                            break;

                        case 'Spawner':
                            ZombieFactory.spawners.push(mesh.position)
                            break;

                        case 'Door':
                            mesh.price = 50
                            mesh.isOpen = false
                            this.DOORS.set(mesh.name, mesh)
                            break;

                        default:
                            console.warn('[MAP] Unrecognized node')
                            break;
                    }
                }
                console.info('[MAP] Map ' + this.mapName + ' has been loaded')

            },
            (err) => {
                console.log(err)
            })
    }
}