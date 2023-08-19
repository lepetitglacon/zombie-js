import * as THREE from "three";
import Zombie from "../../mob/Zombie.js";
import Utils from "../../Utils";

export default class PlayerEvents {

    constructor({engine, socket}) {
        this.engine = engine
        this.socket = socket

    }

    bind() {
        this.socket.on('get_players', players => {
            console.log('GOT PLAYERS ',players)
            for (const player of players) {
                if (player.socketId !== this.socket.id) {
                    Utils.dispatchEventTo('connect', {player: player}, this.engine.playerManager)
                }
            }
        })

        this.socket.on('player-connect', (player) => {
            console.log('PLAYER CONNECTED', player)
        })
        this.socket.on('player_disconnect', (player) => {
            Utils.dispatchEventTo('disconnect', {player: player}, this.engine.playerManager)
        })
        this.socket.on('player_connect', (player) => {
            Utils.dispatchEventTo('connect', {player: player}, this.engine.playerManager)
        })
        this.socket.on('player_disconnect', (player) => {
            Utils.dispatchEventTo('disconnect', {player: player}, this.engine.playerManager)
        })

        this.socket.on('game:players_positions', (playerList) => {
            Utils.dispatchEventTo('positions', {players: playerList}, this.engine.playerManager)
        })

        this.socket.on('player_down', (player) => {
            Utils.dispatchEventTo('down', {player: player}, this.engine.playerManager)
        })
        this.socket.on('player_death', (player) => {
            Utils.dispatchEventTo('death', {player: player}, this.engine.playerManager)
        })
        this.socket.on('player_resurrect', (player) => {
            Utils.dispatchEventTo('resurrect', {player: player}, this.engine.playerManager)
        })
    }

}