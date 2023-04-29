import * as THREE from "three"
import Utils from "../common/Utils.js";


export default class ClientConnector {

    constructor(socket, room) {
        this.socket = socket
        this.roomId = room
        this.game = ZombieServer.GAMES.get(this.roomId)

        this.username = 'Unknown'

        this.maxHealth = 100
        this.health = this.maxHealth

        this.position = new THREE.Vector3(0, 0, 0)
        this.position.set(0, 0, 0)
        this.direction = new THREE.Vector3(0, 0, 0)
        this.color = Utils.randomColor()

        this.lastPosition = new THREE.Vector3(0, 0, 0)
        this.lastDirection = new THREE.Vector3(0, 0, 0)

        this.bind()
        this.init()
        console.log('[CONNECT] ' + this.socket.id + ' connected to room ' + this.roomId)
    }

    init() {
        this.socket.join(this.roomId)

        console.log(this.username)
        // tell other player the new connection
        this.socket.to(this.roomId).emit('player_connect', {
            socketId: this.socket.id,
            username: this.username,
            color: this.color
        })

        // send zombies to socket
        this.socket.emit('get_zombies', this.game.prepareZombiesToEmit(1))

        // send players to socket
        this.socket.emit('get_players', this.game.preparePlayersToEmit(1))
    }

    bind() {
        this.socket.on('ping', () => {
            this.socket.emit('pong')
        })

        this.socket.on('name', (name) => {
            this.username = name
            this.socket.to(this.roomId).emit('player_name', this.socket.id, this.username)
        })

        this.socket.on('player_state', (pos, dir) => {
            this.position.copy(pos)
            this.direction.copy(dir)
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

        this.socket.on('shot', (shot) => {
            for (let i of shot.hits) {
                if (this.game.ZOMBIES.has(i)) {
                    this.game.ZOMBIES.get(i).health -= shot.weapon.damages
                }
            }
            this.socket.to(this.roomId).emit('player_shot', this.socket.id)
        })
    }
}