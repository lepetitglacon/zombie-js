import WaveHandler from "./wave/WaveHandler.js";
import Server from "../../Server.js";
import fs from "fs";
import ZombieFactory from "./mob/ZombieFactory.js";
import NodeThreeExporter from "@injectit/threejs-nodejs-exporters";
import SocketRequestHandler from "../../socket/SocketRequestHandler.js";
import GameMapModel from "../../database/models/GameMapModel.js";
import GameModel from "../../database/models/GameModel.js";

export default class Game extends EventTarget {

    static STATUS = {
        PAUSED: 'PAUSED',
        LOBBY: 'LOBBY',
        RUNNING: 'RUNNING',
        TERMINATED: 'TERMINATED',
    }

    static CONF = {
        timeToStartAGameInSec: 1.5
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

        this.status = Game.STATUS.LOBBY
        this.tickRate = 60
        this.prevTime = Date.now();

        this.bind()
    }

    /**
     * Init elements used in the game
     * @returns {Promise<void>}
     */
    async init() {
        // Init the actual game
        this.GLTFLoader = new NodeThreeExporter()
        await this.parseMap_()
        console.log('should do this after parsing map')

        this.waveHandler = new WaveHandler({game: this})

        console.log('[GAME] game initialized : ' + this.gameId)
    }

    /**
     * Handle last changes before game start and start the game
     */
    run() {
        this.status = Game.STATUS.RUNNING
        this.io.to(this.gameId).emit('game:init:game-start')

        // Start the gameloop
        setInterval(() => {
            this.update()
        }, 1 / this.tickRate * 1000)
    }

    /**
     * Main loop of the game
     */
    update() {
        const time = Date.now();
        const delta = (time - this.prevTime) / 1000;

        if (this.PLAYERS.size > 0) {
            this.waveHandler.update(delta)

            // emit players position to other players
            this.io.to(this.gameId).emit('game:players_positions', this.preparePlayersToEmitForPositions_())
        }
    }

    preparePlayersToEmitForPositions_() {
        const players = []
        for (const [id, player] of this.PLAYERS) {
            players.push({
                _id: player.user._id,
                socketId: player.socket.id,
                position: player.position,
                direction: player.direction
            })
        }
        return players
    }

    parseMap_() {
        const file = fs.readFileSync(Server.__dirname + '/resources/gltf/maps/' + this.map.filename)
        this.GLTFLoader.parse('glb', file,
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
                            // mesh.price = 50
                            // mesh.isOpen = false
                            // this.DOORS.set(mesh.name, mesh)
                            break;
                        default:
                            console.warn('[MAP] Unrecognized node')
                            break;
                    }
                }
                console.info(`[${this.gameId}][MAP] Map ${this.map.name} (${this.map.filename}) has been loaded`)
            },
            (err) => {
                console.log(err)
            })
    }

    canStart_() {
        let gameLoaded = true
        for (const [id, player] of this.PLAYERS) {
            if (!player.clientGameLoaded) {
                gameLoaded = false
            }
        }
        return gameLoaded && this.status !== Game.STATUS.RUNNING;
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

    bind() {
        this.addEventListener('player-connect', () => {

        })
        this.addEventListener('player-disconnect', (e) => {
            this.PLAYERS.delete(e.playerId)
        })
        this.addEventListener('game:init:client_game_instance-loaded_assets', (e) => {
            if (this.canStart_()) {
                this.run()
            }
        })
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

                    this.io.to(this.gameId.toString()).emit('game-counter', {
                        timeInSec: Game.CONF.timeToStartAGameInSec
                    })
                    this.gameStartTimer = setTimeout(async () => {
                        // TODO start game
                        console.log(`-------------`)
                        console.log(`[${this.gameId}] Starting the game with ${this.PLAYERS.size} players on map ${this.map.name}`)
                        console.log(`-------------`)

                        const game = await GameModel.findById(this.gameId)
                        game.allowedPlayers = [...this.PLAYERS.keys()]
                        await game.save()

                        this.init()
                        this.io.to(this.gameId.toString()).emit('game-start') // init game on client
                    }, Game.CONF.timeToStartAGameInSec * 1000)
                }
            } else {
                this.io.to(this.gameId.toString()).emit('stop-game-counter', {
                    reason: 'waiting for players'
                })
                if (this.gameStartTimer) {
                    clearTimeout(this.gameStartTimer)
                    this.gameStartTimer = null
                }
            }
        })
        this.addEventListener('set-map', async (e) => {
            this.map = await GameMapModel.findById(e.mapId)
            console.log(`[${this.gameId}] map set to ${this.map.name}`)
        })
    }
}