import * as THREE from "three"
import Utils from "../common/Utils.js";
import ZombieFactory from "../common/factory/ZombieFactory.js";


export default class ClientConnector {

    constructor(props) {
        this.socket = props.socket
        this.roomId = props.room
        this.game = ZombieServer.GAMES.get(this.roomId)

        this.username = 'Unknown'

        this.maxHealth = 100
        this.health = this.maxHealth

        this.points = 0

        this.position = new THREE.Vector3(0, 0, 0)
        this.position.set(0, 0, 0)
        this.direction = new THREE.Vector3(0, 0, 0)
        this.color = props.color

        this.lastPosition = new THREE.Vector3(0, 0, 0)
        this.lastDirection = new THREE.Vector3(0, 0, 0)

        this.init()
        this.bind()
        console.log('[CONNECT] ' + this.socket.id + ' connected to room ' + this.roomId)
    }

    init() {
        this.socket.join(this.roomId)

        // set map
        this.socket.emit('map', this.game.mapName)

        this.socket.on('register_spawner', (spawners) => {
            if (ZombieFactory.spawners.isSet === undefined) {
                console.log('loading spawners')
                ZombieFactory.spawners.length = 0
                ZombieFactory.spawners = spawners
                ZombieFactory.spawners.isSet = true
            }
        })

        // tell other player the new connection
        this.socket.to(this.roomId).emit('player_connect', {
            socketId: this.socket.id,
            username: this.username,
            position: this.position,
            color: this.color,
            points: this.points
        })

        this.socket.on('ready', () => {
            // send zombies to socket
            this.socket.emit('get_zombies', this.game.prepareZombiesToEmit(1))

            // send players to socket
            this.socket.emit('get_players', this.game.preparePlayersToEmit(1))

            // send chat messages
            this.socket.emit('get_chat_messages', this.game.MESSAGES)

            // send chat messages
            this.socket.emit('points', this.game.preparePoints())
        })
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
            this.game.MESSAGES.push({
                date: Date.now(),
                from: this.socket.id,
                message: msg
            })
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
                    this.points += 10
                }
            }
            ZombieServer.io.to(this.roomId).emit('points', this.game.preparePoints())
            this.socket.to(this.roomId).emit('player_shot', this.socket.id)
        })
    }
}