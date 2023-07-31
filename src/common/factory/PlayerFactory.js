import ClientConnector from "../../server/services/game/ClientConnector.js";
import {Vector3} from "three";

export default class PlayerFactory {
    static playerCount = 0
    static playerColors = [
        0x999999, // white
        0x333399, // blue
        0x993333, // red
        0x339933, // green
    ]
    static playerPosition = [
        new Vector3(-2, 0, -2), // white
        new Vector3(2, 0, -2), // blue
        new Vector3(-2, 0, 2), // red
        new Vector3(2, 0, 2), // green
    ]

    static createClientConnector(player) {

        // console.log('game players size : ' + player.game.PLAYERS.size)
        // console.log('color : ' + this.playerColors[player.game.PLAYERS.size])
        player.color = this.playerColors[player.game.PLAYERS.size]
        player.position = this.playerPosition[player.game.PLAYERS.size]

        return new ClientConnector(player)
    }

}