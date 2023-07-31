import PlayerFactory from "../../../../common/factory/PlayerFactory.js";
import Game from "../Game.js";
import UserModel from "../../../database/models/UserModel.js";

export default class SocketRequestHandler {

    constructor(props) {

        this.server = props.server
        this.socket = props.socket

        this.roomId = this.socket.handshake.query.roomId;
        this.userId = this.socket.handshake.query.userId;

        this.getUserFromDB_().then(() => {
            console.log(this.user)
            this.handleRequest()
        })
    }

    /**
     * Handle connexion to a game
     */
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
            user: this.user,
            game: game
        }))
    }

    async getUserFromDB_() {
        this.user = await UserModel.findOne({_id: this.userId})
    }
}