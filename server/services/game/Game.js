import WaveHandler from "./wave/WaveHandler.js";
import Server from "../../Server.js";
import fs from "fs";
import ZombieFactory from "./mob/ZombieFactory.js";
import NodeThreeExporter from "@injectit/threejs-nodejs-exporters";
import path from "path";
import SocketRequestHandler from "../../socket/SocketRequestHandler.js";

export default class Game extends EventTarget {

    static STATUS = {
        PAUSED: 0,
        RUNNING: 1,
        TERMINATED: 2,
    }

    constructor(props) {
        super()
        this.server = props.server
        this.io = props.io
        this.gameManager = props.gameManager

        this.gameId = props.gameId
        this.name = props.name
        this.map = props.map
        this.owner = props.owner
        this.private = props.private
        this.online = props.online

        this.gameStartTimer = null

        this.PLAYERS = new Map()

        // this.status = Game.STATUS.PAUSED
        //
        // this.tickRate = 60
        // this.prevTime = Date.now();
        //
        // this.map = undefined
        //
        // this.loader = new NodeThreeExporter()
        //
        //
        // this.ZOMBIES = new Map()
        // this.DOORS = new Map()
        //
        // this.waveHandler = new WaveHandler({game: this})

        this.bind()

    }

    bind() {
        this.addEventListener('player-ready', () => {
            let startOrContinueTimer = true
            for (const [id, socketHandler] of this.PLAYERS) {
                if (!socketHandler.ready) {
                    startOrContinueTimer = false
                }
            }
            console.log('start countdown', startOrContinueTimer)
            if (startOrContinueTimer) {
                if (!this.gameStartTimer) {

                    this.io.to(this.gameId.toString()).emit('game-counter')
                    this.gameStartTimer = setTimeout(() => {
                        // TODO start game
                        console.log(`[${this.gameId}] starting the game with ${this.PLAYERS.size} players on map ${this.map}`)
                        this.io.to(this.gameId.toString()).emit('game-start')
                    }, 10000)
                }
            } else {
                this.io.to(this.gameId.toString()).emit('stop-game-counter')
                if (this.gameStartTimer) {
                    clearTimeout(this.gameStartTimer)
                    this.gameStartTimer = null
                }
            }
        })
    }

    run() {

        this.parseMap()

        this.status = Game.STATUS.RUNNING

        console.log('[GAME] game started : ' + this.roomId)
        this.io.to(this.roomId).emit('game_load', {mapName: this.mapName})

        // Signin loop
        setInterval(() => {

            const time = Date.now();
            const delta = (time - this.prevTime) / 1000;

            if (this.PLAYERS.size > 0) {

                // update Zombie life
                for (const [id, zombie] of this.ZOMBIES) {
                    if (zombie.health <= 0) {
                        this.waveHandler.killzombie(id)
                    }
                }

                // spawn zombies
                this.waveHandler.update()

                // update Zombie movement
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
        }, 1 / this.tickRate * 1000)
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
        toSend[i].username = socketHandler.user.username
        toSend[i].gamename = socketHandler.user.gamename
        toSend[i].position = socketHandler.position
        toSend[i].direction = socketHandler.direction
        toSend[i].color = socketHandler.color
        socketHandler.lastPosition.copy(socketHandler.position)
    }

    prepareLobbyPlayersToEmit() {
        let toSend = []
        let i = 0
        for (const [socket, socketHandler] of this.PLAYERS) {
            if (!socketHandler.position.equals(socketHandler.lastPosition)) {
                toSend[i] = {}
                toSend[i].socketId = socketHandler.socket.id
                toSend[i].username = socketHandler.username
                toSend[i].color = socketHandler.color
                i++
            }

        }
        return toSend
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
                points: player.points
            })
        }
        return points
    }

    parseMap() {
        const file = fs.readFileSync(path.join(Server.__dirname, './resources/gltf/maps/' + this.mapName))

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

    createSocketRequestHandler(socket, user) {
        const srh = new SocketRequestHandler({
            game: this,
            server: this.server,
            socket: socket,
            user: user
        })
        this.PLAYERS.set(user._id.toString(), srh)
        console.log(`Added player ${user._id} to game ${this.gameId}`)
    }
}