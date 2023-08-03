import UserModel from "../database/models/UserModel.js";
import GameModel, {GameState} from "../database/models/GameModel.js";
import LobbyClientHandler from "./LobbyClientHandler.js";

export default class SocketRequestHandler {

    constructor(props) {
        this.server = props.server
        this.socket = props.socket

        this.socket.on('connecton', e => {
            console.log('socket connected')
        })

        this.gameId = this.socket.handshake.query.gameId;
        this.userId = this.socket.handshake.query.userId;
    }

    async connect() {
        const user = await UserModel.findOne({_id: this.userId})
        if (!user)
            return this.socket.disconnect()

        const game = await GameModel.findOne({_id: this.gameId})
        if (!game)
            return this.socket.disconnect()

        if (game.players.length >= 4)
            return this.socket.disconnect()

        switch (game.state) {
            case GameState.LOBBY: {
                new LobbyClientHandler({
                    server: this.server,
                    socket: this.socket,
                    game: game,
                    user: user,
                })
            }
            case GameState.RUNNING: {

            }
            case GameState.COMPLETED: {

            }
        }

        // game.PLAYERS.set(this.socket, PlayerFactory.createClientConnector({
        //     socket: this.socket,
        //     roomId: this.roomId,
        //     user: this.user,
        //     game: game
        // }))
    }
}