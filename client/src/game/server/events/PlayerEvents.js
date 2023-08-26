import Utils from "../../Utils";

export default class PlayerEvents {

    constructor({engine, socket}) {
        this.engine = engine
        this.socket = socket

    }

    bind() {
        this.socket.on('get_players', players => {
            console.log('GOT PLAYERS ', players)
            for (const player of players) {
                if (player.socketId !== this.socket.id) {
                    Utils.dispatchEventTo('connect', {player: player}, this.engine.playerManager)
                }
            }
        })

        this.socket.on('game:player-connect', (player) => {
            console.log('PLAYER CONNECTED', player)
            Utils.dispatchEventTo('connect', {player: player}, this.engine.playerManager)
        })
        this.socket.on('game:player-disconnect', (player) => {
            Utils.dispatchEventTo('disconnect', {player: player}, this.engine.playerManager)
        })

        this.socket.on('game:players_positions', (playerList) => {
            Utils.dispatchEventTo('positions', {players: playerList}, this.engine.playerManager)
        })

        this.socket.on('game:player_shot', (e) => {
            Utils.dispatchEventTo('player_shot', e, this.engine.playerManager)
            Utils.dispatchEventTo('player_shot', e, this.engine.controllablePlayer)
        })


        this.socket.on('game:player_down', (player) => {
            Utils.dispatchEventTo('down', {player: player}, this.engine.playerManager)
        })
        this.socket.on('game:player_death', (player) => {
            Utils.dispatchEventTo('death', {player: player}, this.engine.playerManager)
        })
        this.socket.on('game:player_resurrect', (player) => {
            Utils.dispatchEventTo('resurrect', {player: player}, this.engine.playerManager)
        })
    }

}