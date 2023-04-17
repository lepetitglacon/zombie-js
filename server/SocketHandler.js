import * as THREE from "three"


export default class SocketHandler {
    static ROOM_NAME = "zombie_game_X"

    constructor(socket) {
        this.socket = socket
        this.socket.join(SocketHandler.ROOM_NAME)

        this.position = new THREE.Vector3(0, 0, 0)
        this.position.set(0, 0, 0)

        this.bind()
    }

    init() {
    }

    bind() {
        this.socket.on('ping', () => {
            this.socket.emit('pong')
        })
        this.socket.on('position', (pos) => {
            pos.y = 0
            this.position = pos
        })
    }
}