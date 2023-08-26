import UserModel from "../database/models/UserModel.js";
import GameModel, {GameState} from "../database/models/GameModel.js";
import MessageModel from "../database/models/MessageModel.js";
import GameMapModel from "../database/models/GameMapModel.js";
import {Vector3} from "three";
import Game from "../services/game/Game.js";
import Utils from "../Utils.js";

export default class SocketRequestHandler {

    constructor(props) {
        this.lobby = props.lobby
        this.game = props.game
        this.server = props.server
        this.io = this.server.io
        this.socket = props.socket
        this.user = props.user

        this.ready = false
        this.isOwner = this.user._id.toString() === this.game.owner._id.toString()
        this.clientGameLoaded = false

        this.position = new Vector3()
        this.direction = new Vector3()
        this.points = 0
        this.maxHealth = 100
        this.health = this.maxHealth

        console.log(`${this.socket.id} connected to game "${this.game.gameId}"`)

        // TODO
        this.bindEventsGlobal()
        this.bindEventsForLobby()
        this.bindEventsForGame()

        switch (this.game.status) {
            case Game.STATUS.LOBBY: {
                this.io.to(this.game.gameId.toString()).emit('lobby:player-connect', this.getPlayersForLobby())
                break
            }
            case Game.STATUS.RUNNING: {
                this.io.to(this.game.gameId.toString()).emit('game:player-connect', this.getPlayersForGame())
                break
            }
        }
        this.socket.join(this.game.gameId.toString())
    }

    bindEventsGlobal() {
        this.socket.on('ping', async (e) => {
            this.socket.emit('ping', {delay: Date.now() - e.timestamp})
        })
    }

    bindEventsForLobby() {
        this.socket.on('disconnect', (reason) => {
            console.log(`${this.socket.id} disconnected for reason "${reason}"`)
            Utils.dispatchEventTo(
                'player-disconnect',
                {playerId: this.user._id.toString()},
                this.game
            )
            if (this.isOwner) {
                this.io.to(this.game.gameId).emit('game-deleted')
                Utils.dispatchEventTo(
                    'delete-game',
                    {gameId: this.game.gameId},
                    this.game.gameManager
                )
                console.log('owner is leaving')
            }
            this.io.to(this.game.gameId.toString()).emit('lobby:player-disconnect', this.user)
        })

        // init client info
        this.socket.on('lobby:init', async () => {
            this.socket.emit('maps', await GameMapModel.find(
                {playable: true},
                ['_id', 'name', 'preview']
            ))
            this.socket.emit('lobby:init:messages', await this.getMessages_())
            this.socket.emit('lobby:init:players', this.getPlayersForLobby())

            if (this.isOwner) {this.socket.emit('lobby:init:owner', true)}
            if (this.game.map) {this.socket.emit('lobby:init:map', {mapId: this.game.map._id})}
        })

        // messages
        this.socket.on('lobby:message', async (e) => {
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

        this.socket.on('lobby:player-ready', async (e) => {
            console.log(e)
            this.ready = e.ready
            this.game.dispatchEvent(new Event('player-ready'))
        })

        this.socket.on('lobby:set-map', async (e) => {
            console.log('client is setting map to ', e)
            this.socket.to(this.game.gameId).emit('map', e)

            this.dispatchEventTo_('set-map', {
                mapId: e.mapId
            })
        })
    }

    bindEventsForGame() {

        this.socket.on('game:init:client_game_instance-ready-for-init', async (e) => {
            console.log(`[${this.socket.id}] connecting to game instance`)

            this.socket.emit('game:init:loading-connected')
            this.socket.emit('game:init:assets_to_load', { // TODO replace hard values by assets in GameMapModel
                map: [
                    'gltf/maps/' + this.game.map.filename,
                ],
                models: [
                    {
                        name: 'zombie',
                        path: 'gltf/zombie/zombie.glb',
                    },
                    {
                        name: 'player',
                        path: 'gltf/player.glb',
                    }
                ],
                sounds: [
                    {
                        name: 'weapon_pistol_shot',
                        path: 'sound/gunshot.wav',
                    },
                    {
                        name: 'weapon_pistol_reload',
                        path: 'sound/gunreload.mp3',
                    },
                    {
                        name: 'weapon_pistol_reload_fail',
                        path: 'sound/weapons/reload_fail.mp3',
                    },
                    {
                        name: 'weapon_knife_slash',
                        path: 'sound/knife.wav',
                    }
                ],
                weapons: [
                    'gltf/maps/' + this.game.map.filename,

                ]
            })
        })

        this.socket.on('game:init:client_game_instance-loaded_assets', () => {
            this.clientGameLoaded = true
            this.dispatchEventTo_('game:init:client_game_instance-loaded_assets')
        })

        this.socket.on('game:player_position', (pos, dir) => {
            this.position.copy(pos)
            this.direction.copy(dir)
        })

        this.socket.on('game:get_players', () => {
            this.socket.emit('get_players', this.getPlayersForGame())
        })

        this.socket.on('game:shot', (shot) => {
            Utils.dispatchEventTo('shot', {shot: shot}, this.game.waveHandler)

            // this.io.to(this.game.gameId).emit('points', this.game.preparePoints())
            this.socket.to(this.game.gameId).emit('game:player_shot', {playerId: this.socket.id, weapon: shot.weapon, sound: shot.soundName})
        })

    }

    async getMessages_() {
        return await MessageModel.find({game: this.game.gameId}).sort({dateReceived: 1}).populate('user')
    }

    getPlayersForLobby() {
        const players = []
        for (const [id, player] of this.game.PLAYERS) {
            players.push({
                _id: player.user._id,
                socketId: player.socket.id,
                gamename: player.user.gamename,
                color: player.user.color
            })
        }
        return players
    }

    getPlayersForGame() {
        const players = []
        for (const [id, player] of this.game.PLAYERS) {
            const p = {
                socketId: player.socket.id,
                position: player.position,
                direction: player.direction,
                gamename: player.gamename,
                points: player.points,
                color: player.user.color
            }
            players.push(p)
        }
        return players
    }

    dispatchEventTo_(eventName, data, to = this.game) {
        const event = new Event(eventName)
        Object.assign(event, data)
        to.dispatchEvent(event)
    }
}