import UserModel from "../database/models/UserModel.js";
import GameModel, {GameState} from "../database/models/GameModel.js";
import LobbyClientHandler from "./LobbyClientHandler.js";
import MessageModel from "../database/models/MessageModel.js";
import GameMapModel from "../database/models/GameMapModel.js";
import {Vector3} from "three";

export default class SocketRequestHandler {

    constructor(props) {
        this.game = props.game
        this.server = props.server
        this.io = this.server.io
        this.socket = props.socket
        this.user = props.user
        this.user.socketId = this.socket.id

        this.ready = false
        this.isOwner = false

        this.position = new Vector3()
        this.direction = new Vector3()

        this.clientGameLoaded = false

        this.io.to(this.game.gameId.toString()).emit('player-connect', this.user)
        this.socket.join(this.game.gameId.toString())

        console.log(`${this.socket.id} connected to game "${this.game.gameId}"`)
        this.bind()
    }

    bind() {

        /**
         * LOBBY
         */

        this.socket.on('disconnect', (reason) => {
            console.log(`${this.socket.id} disconnected for reason "${reason}"`)

            this.dispatchEventTo_('player-disconnect', {
                playerId: this.user._id.toString()
            })

            if (this.isOwner) {
                this.io.to(this.game.gameId).emit('game-deleted')

                this.dispatchEventTo_('delete-game', {
                    gameId: this.game.gameId
                }, this.game.gameManager)
                console.log('owner is leaving')
            }

            this.io.to(this.game.gameId.toString()).emit('player-disconnect', this.user)
        })

        // init client info
        this.socket.on('init', async () => {
            const msgs = await this.getMessages()
            this.socket.emit('messages', msgs)

            this.socket.emit('players', this.getPlayersToSend())

            if (this.user._id.toString() === this.game.owner._id.toString()) {
                this.socket.emit('owner', true)
                this.isOwner = true
            }

            if (this.game.map) {
                this.socket.emit('set-map', {mapId: this.game.map._id})
            }
        })

        this.socket.on('message', async (e) => {
            const game = await GameModel.findById(this.game.gameId)
            const user = await UserModel.findById(e.userId)
            const message = new MessageModel({
                game: game._id,
                user: user._id,
                text: e.message,
                dateSent: e.date,
                dateReceived: Date.now()
            })
            await message.save()
            const messageToSend = await MessageModel.findById(message._id).populate('user')
            this.io.to(this.game.gameId.toString()).emit('message', messageToSend)
        })

        this.socket.on('player-ready', async (e) => {
            console.log(e)
            this.ready = e.ready
            this.game.dispatchEvent(new Event('player-ready'))
        })

        this.socket.on('map', async (e) => {
            console.log(e)
            this.socket.to(this.game.gameId).emit('set-map', e)

            this.dispatchEventTo_('set-map', {
                mapId: e.mapId
            })
        })

        this.socket.on('ping', async (e) => {
            this.socket.emit('ping', {delay: Date.now() - e.timestamp})
        })

        /**
         * GAME START
         */

        this.socket.on('gameInstance-init', async (e) => {
            console.log(`[${this.socket.id}] connecting to game instance`)
            this.socket.emit('loading-connected')

            this.io.to(this.game.gameId.toString()).emit('loading-assets', {
                map: [
                    'gltf/maps/' + this.game.map.filename,
                ],
                models: [
                    {
                        name: 'zombie',
                        path: 'gltf/zombie/zombie.glb',
                    }
                ],
                sounds: [
                    'gltf/maps/' + this.game.map.filename,

                ],
                weapons: [
                    'gltf/maps/' + this.game.map.filename,

                ]
            })
        })

        this.socket.on('client-game-loaded', () => {
            this.clientGameLoaded = true
            this.dispatchEventTo_('player-client-game-loaded')
        })

        this.socket.on('player_state', (pos, dir) => {
            this.position.copy(pos)
            this.direction.copy(dir)
        })
    }

    async getMessages() {
        return await MessageModel.find({game: this.game.gameId}).sort({dateReceived: 1}).populate('user')
    }

    getPlayersToSend() {
        const players = []
        for (const [id, player] of this.game.PLAYERS) {
            players.push(player.user)
        }
        return players
    }

    dispatchEventTo_(eventName, data, to = this.game) {
        const event = new Event(eventName)
        Object.assign(event, data)
        to.dispatchEvent(event)
    }
}