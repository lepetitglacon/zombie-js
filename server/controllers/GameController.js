import UserModel from "../database/models/UserModel.js";
import GameModel, {GameState} from "../database/models/GameModel.js";
import GameMapModel from "../database/models/GameMapModel.js";
import Game from "../services/game/Game.js";
import {Vector3} from "three";

export default class GameController {

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
        this.server = props.server
        this.GAMES = new Map()
    }

    async init() {
        const gamesToStartFromDB = await GameModel.find({state: GameState.LOBBY})
        for (const gameToStart of gamesToStartFromDB) {
            this.GAMES.set(gameToStart._id.toString(), this.createGameInstance_(gameToStart))
        }
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

        const gameInstance = this.createGameInstance_(newGameFromDB)

        this.GAMES.set(newGameFromDB._id.toString(), gameInstance)
        return newGameFromDB._id.toString()
    }

    /**
     * Starts a game with a map
     * @param props
     * @returns {Promise<boolean>}
     */
    async start(props) {
        const gameMap = await GameMapModel.findOne({'_id': props.mapId})
    }

    /**
     * Lobby
     */
    delete() {

    }

    find(gameId) {
        if (this.GAMES.has(gameId)) {
            return this.GAMES.get(gameId)
        }
    }

    async connect(socket) {
        const game = this.find(socket.handshake.query.gameId)
        if (!game) return
        if (game.PLAYERS.size >= 4) return socket.disconnect()
        const user = await UserModel.findById(
            socket.handshake.query.userId,
            ['_id', 'gamename', 'color']
        )
        if (!user) return
        game.createSocketRequestHandler(socket, user)
    }

    async join(game, user) {
        if (!game.players.has(user._id.toString())) {

            // set properties for user
            user.color = GameController.playerColors[game.players.size - 1]
            game.players.set(user._id, user)
        }
        return game.save()
    }

    async leave(game, user) {
        if (game.players.has(user._id.toString())) {
            game.players.delete(user._id.toString())
        }

        return game.save()
    }

    async createDBGame_(props, populate = false) {
        return new GameModel({
            name: props.name,
            owner: props.owner,
            private: props.private,
            online: false,
        }).save()
    }

    createGameInstance_(gameToStart) {
        return new Game({
            gameId: gameToStart._id.toString(),
            name: gameToStart.name,
            owner: gameToStart.owner,
            private: gameToStart.private,
            online: gameToStart.online,
            io: this.server.io,
            server: this.server,
        })
    }
}