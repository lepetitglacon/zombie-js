import UserModel from "../database/models/UserModel.js";
import GameModel, {GameState} from "../database/models/GameModel.js";
import GameMapModel from "../database/models/GameMapModel.js";
import Game from "../services/game/Game.js";
import {Vector3} from "three";

export default class gameManager extends EventTarget{

    static playerColors = [
        0x999999, // white
        0x333399, // blue
        0x993333, // red
        0x339933, // green
    ]
    static playerPosition = [
        new Vector3(-2, 0, -2), // white
        new Vector3(2, 0, -2), // blue
        new Vector3(-2, 0, 2), // red
        new Vector3(2, 0, 2), // green
    ]

    constructor(props) {
        super()
        this.server = props.server
        this.GAMES = new Map()

        this.bind()
    }

    bind() {
        this.addEventListener('delete-game', async (e) => {
            if (this.GAMES.has(e.gameId)) {
                delete this.GAMES.get(e.gameId)
                this.GAMES.delete(e.gameId)

                await GameModel.findByIdAndUpdate(
                    e.gameId,
                    {
                        state: GameState.ARCHIVED,
                        archiveDate: Date.now()
                    }
                )
                console.log(`[GAME] ${e.gameId} deleted`)
            }
        })
    }

    async init() {
        const gamesToStartFromDB = await GameModel.find({state: GameState.LOBBY})
        for (const gameToStart of gamesToStartFromDB) {
            this.GAMES.set(gameToStart._id.toString(), await this.createGameInstance_(gameToStart))
        }
        console.log(`[SERVER][GAMES] games created from DB`, this.GAMES)
    }

    /**
     * Lobby
     */
    async create(props) {
        const owner = await UserModel.findById(props.ownerId)
        if (!owner) {
            throw new Error('[GAME][CREATION] Cannot find owner')
        }
        props.owner = owner

        const newGameFromDB = await this.createDBGame_(props)
        if (!newGameFromDB) {
            throw new Error('[GAME][CREATION] Error while creating the DB game')
        }

        console.log('[GAME] created [' + newGameFromDB._id + ']')
        const gameInstance = await this.createGameInstance_(newGameFromDB)

        this.GAMES.set(newGameFromDB._id.toString(), gameInstance)
        return newGameFromDB._id.toString()
    }

    async connect(socket) {
        const game = this.findExistingGameFromId_(socket.handshake.query.gameId)
        if (!game) {
            console.log('[SOCKET][PRE] Game not found')
            socket.emit('custom-disconnect', {reason: 'Game not found'})
            return socket.disconnect()
        }
        if (game.PLAYERS.size >= 4) {
            console.log('[SOCKET][PRE] Game full')
            socket.emit('custom-disconnect', {reason: 'Game full'})
            return socket.disconnect()
        }
        const user = await UserModel.findById(
            socket.handshake.query.userId,
            ['_id', 'gamename', 'color']
        )
        if (!user) {
            console.log('[SOCKET][PRE] User not found')
            socket.emit('custom-disconnect', {reason: 'User not found'})
            return socket.disconnect()
        }
        game.createSocketRequestHandler(socket, user)
    }

    /**
     *
     * @param gameId
     * @returns {Game|null}
     * @private
     */
    findExistingGameFromId_(gameId) {
        if (this.GAMES.has(gameId)) {
            return this.GAMES.get(gameId)
        }
        return null
    }

    async createDBGame_(props, populate = false) {
        return new GameModel({
            name: props.name,
            owner: props.owner,
            private: props.private,
            online: false,
        }).save()
    }

    /**
     *
     * @param gameToStart
     * @returns {Game}
     * @private
     */
    async createGameInstance_(gameToStart) {
        const maps = await GameMapModel.find({}).limit(1)
        return new Game({
            gameId: gameToStart._id.toString(),
            name: gameToStart.name,
            owner: gameToStart.owner,
            private: gameToStart.private,
            online: gameToStart.online,
            map: maps[0],
            io: this.server.io,
            server: this.server,
            gameManager: this
        })
    }
}