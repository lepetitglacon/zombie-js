import * as THREE from "three"
import Utils from "../../common/Utils.js";
import ZombieFactory from "../../common/factory/ZombieFactory.js";


export default class ClientConnector {

    constructor(props) {
        this.socket = props.socket
        this.roomId = props.roomId
        this.game = props.game

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
        console.log('[PLAYER][CONNECTED] ' + this.socket.id + ' connected to room ' + this.roomId)
    }

    init() {

        this.socket.on('connect', () => {
            console.warn('[SOCKET] connected')
        })


        this.socket.join(this.roomId)

        // tell other player the new connection
        this.socket.to(this.roomId).emit('player_connect', {
            socketId: this.socket.id,
            username: this.username,
            position: this.position,
            color: this.color,
            points: this.points
        })

        this.socket.on('game-state', () => {
            this.socket.emit('game-state', {
                state: this.game.status,
                map: this.game.mapName,
            })
        })

        this.socket.on('lobby-ready', () => {
            console.log('~lobby-ready')
            // send lobby players to socket
            this.socket.emit('get_players', this.game.preparePlayersToEmit(1))
        })

        /**
         * On player is ready in lobby
         */
        this.socket.on('lobby-player-ready', () => {
            // TODO set player as ready to start game
        })

        /**
         * On game ready
         */
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

        this.socket.on('wave', () => {
            this.socket.emit('wave_update', {wave: this.game.waveHandler.wave})
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
            for (let i in shot.hits) {
                const zombieId = shot.hits[i].id

                if (this.game.ZOMBIES.has(zombieId)) {
                    this.game.ZOMBIES.get(zombieId).health -= shot.hits[i].damages
                    this.points += shot.hits[i].points
                }
            }

            ZombieServer.io.to(this.roomId).emit('points', this.game.preparePoints())
            this.socket.to(this.roomId).emit('player_shot', {playerId: this.socket.id, weapon: shot.weapon, sound: shot.soundName})
        })

        /**
         * When a player try to buy/open a door
         */
        this.socket.on('door_buy', (buyObject) => {

            console.log(`[DOORS] ${this.socket.id} trying to buy door ${buyObject.doorId}`)

            if (this.game.PLAYERS.has(this.socket)) {
                const player = this.game.PLAYERS.get(this.socket)

                if (this.game.DOORS.has(buyObject.doorId)) {

                    if (player.points >= this.game.DOORS.get(buyObject.doorId).price) {

                        player.points -= this.game.DOORS.get(buyObject.doorId).price
                        this.socket.emit('points', this.game.preparePoints())


                        console.log(`[DOORS] ${buyObject.doorId} opened`)
                        ZombieServer.io.to(this.roomId).emit('door_opened', buyObject.doorId)
                        this.game.DOORS.delete(buyObject.doorId)
                    }
                }
            }
        })

        this.socket.on('map_loaded_doors', () => {
            let doors = new Map()
            for (const [doorId, door] of this.game.DOORS) {
                if (door.isOpen) {
                    doors.set(doorId, door)
                }
            }

            // send doors opened
            this.socket.emit('get_opened_door', [...doors])
            this.socket.emit('points', this.game.preparePoints())
        })


    }
}