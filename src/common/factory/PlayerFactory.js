import ClientConnector from "../../server/service/ClientConnector.js";

export default class PlayerFactory {
    static playerCount = 0
    static playerColors = [
        0x999999, // white
        0x333399, // blue
        0x993333, // red
        0x339933, // green
    ]

    static createClientConnector(player) {


        console.log('game players size : ' + player.game.PLAYERS.size)
        console.log('color : ' + this.playerColors[player.game.PLAYERS.size])
        player.color = this.playerColors[player.game.PLAYERS.size]


        return new ClientConnector(player)
    }

}