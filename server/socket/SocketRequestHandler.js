import UserModel from "../database/models/UserModel.js";
import GameModel, {GameState} from "../database/models/GameModel.js";
import LobbyClientHandler from "./LobbyClientHandler.js";
import MessageModel from "../database/models/MessageModel.js";

export default class SocketRequestHandler {

    constructor(props) {
        this.game = props.game
        this.server = props.server
        this.io = this.server.io
        this.socket = props.socket
        this.user = props.user
        this.user.socketId = this.socket.id
        this.ready = false

        this.socket.join(this.game.gameId.toString())

        if (this.user._id.toString() === this.game.owner._id.toString()) {
            this.socket.emit('owner', true)
        }
        this.socket.emit('players', this.user)
        this.io.to(this.game.gameId.toString()).emit('player-connect', this.user)

        console.log(`${this.socket.id} connected to game "${this.game.gameId}"`)
        this.bind()
    }

    bind() {
        this.socket.on('disconnect', (reason) => {
            console.log(`${this.socket.id} disconnected for reason "${reason}"`)

            this.io.to(this.game.gameId.toString()).emit('player-disconnect', this.user)
        })

        // init client info
        this.socket.on('init', async () => {
            const msgs = await this.getMessages()
            this.socket.emit('messages', msgs)
            const players = [{
                socketId: this.socket.id,
                name: 'test'
            }]
            this.socket.emit('players', players)
        })

        this.socket.on('message', async (e) => {
            console.log(e)
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
    }

    async getMessages() {
        return await MessageModel.find({game: this.game.gameId}).sort({dateReceived: 1}).populate('user')
    }
}