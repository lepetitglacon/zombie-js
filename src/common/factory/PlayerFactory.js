// import Player from "../../client/mob/Player.js";
import ClientConnector from "../../server/ClientConnector.js";

export default class PlayerFactory {
    static playerCount = 0
    static playerColors = [
        0xeeeeee, // white
        0x333399, // blue
        0x993333, // red
        0x993399, // yellow
    ]

    // static createClientPlayer(player) {
    //     return new Player(player)
    // }

    static createServerPlayer(player) {
        console.log(this.playerColors[this.playerCount])
        player.color = this.playerColors[this.playerCount++]

        return new ClientConnector(player)
    }

}