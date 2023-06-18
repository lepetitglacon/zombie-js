import ClientConnector from "../../server/service/ClientConnector.js";

export default class PlayerFactory {
    static playerCount = 0
    static playerColors = [
        0x999999, // white
        0x333399, // blue
        0x993333, // red
        0x999933, // yellow
    ]

    static createClientConnector(player) {
        player.color = this.playerColors[this.playerCount++]

        return new ClientConnector(player)
    }

}