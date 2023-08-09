import UserModel from "../database/models/UserModel.js";
import GameModel, {GameState} from "../database/models/GameModel.js";
import LobbyClientHandler from "./LobbyClientHandler.js";
import MessageModel from "../database/models/MessageModel.js";
import GameMapModel from "../database/models/GameMapModel.js";

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

        this.io.to(this.game.gameId.toString()).emit('player-connect', this.user)

        this.socket.join(this.game.gameId.toString())

        console.log(`${this.socket.id} connected to game "${this.game.gameId}"`)
        this.bind()
    }

    bind() {
        this.socket.on('disconnect', (reason) => {
            console.log(`${this.socket.id} disconnected for reason "${reason}"`)
            this.game.PLAYERS.delete(this.user._id.toString())

            if (this.isOwner) {
                const ev = new Event('delete-game')
                ev.gameId = this.game.gameId
                ev.test = 'test'
                this.game.gameManager.dispatchEvent(ev)
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

            const ev = new Event('set-map')
            ev.mapId = e.mapId
            this.game.dispatchEvent(ev)
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
}