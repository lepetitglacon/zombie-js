import * as THREE from "three"


export default class Old_socket_handler {

    constructor(props) {
        this.socket = props.socket
        this.roomId = props.roomId
        this.user = props.user
        this.game = props.game

        this.username = props.username ?? 'Unknown'
        this.maxHealth = 100
        this.health = this.maxHealth
        this.color = props.color

        this.position = props.position.clone()
        this.direction = new THREE.Vector3(0, 0, 0)
        this.lastPosition = new THREE.Vector3(0, 0, 0)
        this.lastDirection = new THREE.Vector3(0, 0, 0)

        // stats
        this.kills = 0
        this.headshotKills = 0
        this.points = 0
        this.allPoints = 0

        console.log(`[${this.roomId}][PLAYER][CONNECTING] ${this.socket.id} (${this.user.username})`)
        this.init()
        this.prepareLobby()
        this.bind()
    }

    prepareLobby() {
        this.socket.join('/lobby/' + this.roomId)
        this.socket.emit('get_players', this.game.preparePlayersToEmit(1))

        this.socket.on('lobby-ready', (isReady) => {
            console.log('received ready event')
            // send lobby players to socket
            this.socket.emit('get_players', this.game.preparePlayersToEmit(1))
        })

        this.socket.on('lobby-map-change', (e) => {
            this.socket.broadcast.emit('lobby-map-change', e)
        })

        this.socket.on('lobby-chat', (e) => {
            this.socket.broadcast.emit('lobby-map-change', e)
        })
    }

    init() {
        this.socket.on('connect', () => {
            console.log(`[${this.roomId}][PLAYER][CONNECTED] ${this.socket.id} (${this.user.username})`)
        })

        this.socket.join(this.roomId)

        // tell other player the new connection
        this.socket.to(this.roomId).emit('player_connect', {
            socketId: this.socket.id,
            username: this.user.username,
            gamename: this.user.gamename,
            position: this.position,
            color: this.color,
            points: this.points
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
                console.log(`[${this.roomId}][PLAYER][DISCONNECTED] ${this.socket.id} (${this.user.username})`)
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