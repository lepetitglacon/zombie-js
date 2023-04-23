import * as THREE from "three"
import Utils from "../common/Utils.js";


export default class ClientConnector {

    constructor(socket, room) {
        this.socket = socket
        this.roomId = room

        this.position = new THREE.Vector3(0, 0, 0)
        this.position.set(0, 0, 0)

        this.direction = new THREE.Vector3(0, 0, 0)
        this.color = Utils.randomColor()

        this.bind()
        console.log('[CONNECT] ' + this.socket.id + ' connected to room ' + this.roomId)
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
    }

    prepareClient() {

    }
}