import GameMapModel from "../../database/models/GameMapModel.js";
import GameModel from "../../database/models/GameModel.js";

export default class GameLobby extends EventTarget {

    static CONF = {
        timeToStartAGameInSec: 1.5
    }

    constructor({props}) {
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
            this.tickRate = 60
        this.prevTime = Date.now();

        this.bind()
    }

    canStart_() {
        let gameLoadedForEveryPlayer = true
        for (const [id, player] of this.PLAYERS) {
            if (!player.clientGameLoaded) {
                gameLoadedForEveryPlayer = false
            }
        }
        if (gameLoadedForEveryPlayer) {
            this.run()
        } else {
            console.log('allready RUNNING')
        }
    }

    bind() {
        this.addEventListener('player-connect', () => {

        })
        this.addEventListener('player-disconnect', (e) => {
            this.PLAYERS.delete(e.playerId)
        })
        this.addEventListener('player-client-game-loaded', (e) => {
            console.log('client loaded the game')
            this.canStart_()
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