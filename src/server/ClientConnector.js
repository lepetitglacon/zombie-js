import * as THREE from "three"
import Utils from "../common/Utils.js";


export default class ClientConnector {

    constructor(socket, room) {
        this.socket = socket
        this.roomId = room
        this.game = ZombieServer.GAMES.get(this.roomId)

        this.position = new THREE.Vector3(0, 0, 0)
        this.position.set(0, 0, 0)
        this.direction = new THREE.Vector3(0, 0, 0)
        this.color = Utils.randomColor()

        this.init()
        this.bind()
        console.log('[CONNECT] ' + this.socket.id + ' connected to room ' + this.roomId)
    }

    init() {
        this.socket.join(this.roomId)

        // tell other player the new connection
        this.socket.to(this.roomId).emit('player_connect', {
            socketId: this.socket.id,
            color: this.color
        })

        // send players to socket
        if (this.game.PLAYERS.size > 0) {
            this.socket.emit('get_players', this.game.preparePlayersToEmit())
        }
    }

    bind() {
        this.socket.on('ping', () => {
            this.socket.emit('pong')
        })
        this.socket.on('player_state', (pos, dir) => {
            this.position = pos
            this.direction = dir
        })
        this.socket.on('chat', (msg) => {
            this.socket.to(this.roomId).emit('chat', msg, this.socket.id)
        })
        // disconnect
        this.socket.on('disconnect', () => {
            if (this.game.PLAYERS.has(this.socket)) {
                this.socket.to(this.roomId).emit('player_disconnect', this.socket.id)
                this.game.PLAYERS.delete(this.socket)
                console.log(`[DISCONNECT] ${this.socket.id} disconnected`);
            }
        })
    }
}