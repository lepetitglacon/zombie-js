import UserModel from "../database/models/UserModel.js";
import GameModel from "../database/models/GameModel.js";
import Game from "../services/game/Game.js";
import GameMapModel from "../database/models/GameMapModel.js";
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

        this.GAMES = this.server.GAMES
    }

    /**
     * Lobby
     */
    async create(props) {

        const owner = await UserModel.findOne({_id: props.ownerId}).exec()
        if (!owner) {
            throw new Error('[GAME][CREATION] Cannot find owner')
        }

        const newGameFromDB = await new GameModel({
            name: props.name,
            private: props.private,
            online: this.isOnlineMode,
            owner: owner,
            // map: map,
        }).save()

        if (!newGameFromDB) {
            throw new Error('[GAME][CREATION] Error while creating the DB game')
        }



        console.log('[GAME] created [' + newGameFromDB._id + ']')
        return newGameFromDB._id.toString()
    }

    /**
     * Starts a game with a map
     * @param props
     * @returns {Promise<boolean>}
     */
    async start(props) {

        const dbGame = await GameModel.findOne({'_id': props.gameId})
        if (!dbGame)
            return false

        if (this.GAMES.has(props.gameId))
            return false

        const gameMap = await GameMapModel.findOne({'_id': props.mapId})

        const gameInstance = new Game({
            name: dbGame.name,
            private: dbGame.private,
            owner: dbGame.owner,
            map: dbGame.map,
            roomId: dbGame._id,
            online: dbGame.isOnlineMode,
            mapName: props.mapName,
            server: this.io
        })

        if (gameInstance.status !== Game.STATUS.RUNNING) {
            gameInstance.run()
        }

        this.server.GAMES.set(dbGame._id.toString(), gameInstance)

        return true
    }

    /**
     * Lobby
     */
    delete() {

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

    shouldStart(game) {

    }

}