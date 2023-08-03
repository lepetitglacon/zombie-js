import GameController from "../controllers/GameController.js";

export default class LobbyClientHandler {

    constructor(props) {
        this.server = props.server
        this.socket = props.socket
        this.game = props.game
        this.user = props.user
        this.roomId = '/lobby/' + this.game._id

        this.socket.join(this.roomId)
        this.server.io.to(this.roomId).emit('get_players', this.game.players)

        this.bind()
        console.log(`[LOBBY][${this.game._id}][USER][${this.user._id}][JOIN]`)
    }

    bind() {
        this.socket.on('ready', (isReady) => {
            this.server.io.to(this.roomId).emit('player-ready', {
                userId: this.user._id.toString(),
                isReady: isReady,
            })

            const gc = new GameController()
        })


        this.socket.on('lobby-map-change', (e) => {
            this.socket.broadcast.emit('lobby-map-change', e)
        })

        this.socket.on('lobby-chat', (e) => {
            this.socket.broadcast.emit('lobby-map-change', e)
        })
    }

}