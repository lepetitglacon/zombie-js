import PlayerFactory from "../../../common/factory/PlayerFactory.js";
import Game from "../Game.js";

export default class SocketRequestHandler {

    constructor(props) {

        this.server = props.server
        this.socket = props.socket

        this.roomId = this.socket.handshake.query.roomId;

        this.handleRequest()
    }

    handleRequest() {
        if (!this.server.GAMES.has(this.roomId)) {
            this.socket.disconnect(true);
            return;
        }

        const game = this.server.GAMES.get(this.roomId)

        // game check
        if (game.PLAYERS.size >= 4) {
            this.socket.disconnect(true);
            return;
        }
        if (game.status === Game.STATUS.RUNNING) {
            this.socket.disconnect(true);
            return;
        }

        game.PLAYERS.set(this.socket, PlayerFactory.createClientConnector({
            socket: this.socket,
            roomId: this.roomId,
            game: game
        }))
    }

}