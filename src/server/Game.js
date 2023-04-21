import SocketHandler from "./SocketHandler.js";
import { Server } from "socket.io"

export default class Game {

    constructor(server) {
        const io = new Server(server);
        this.name = ''

        this.PLAYERS = new Map()
        this.ZOMBIES = new Map()

        this.tickRate = 60


        io.on('connection', (socket) => {
            console.log(`[CONNECT] ${socket.id} just connected`);

            // adding socket to players
            this.PLAYERS.set(socket, new SocketHandler(socket))

            // tell other player the new connection
            socket.broadcast.emit('player_connect', {
                socketId: socket.id,
                color: this.PLAYERS.get(socket).color
            })

            // send players to socket
            if (this.PLAYERS.size > 1) {
                socket.emit('get_players', this.preparePlayersToEmit(socket.id))
            }

            // disconnect
            socket.on('disconnect', () => {
                if (this.PLAYERS.has(socket)) {
                    socket.broadcast.emit('player_disconnect', socket.id)
                    this.PLAYERS.delete(socket)
                    console.log(`[DISCONNECT] ${socket.id} disconnected`);
                    this.logPlayers()
                }
            })

            this.logPlayers()
        });
    }

    run() {
        setInterval(() => {
            if (this.PLAYERS.size > 1) {
                this.io.emit('players_position', this.preparePlayersToEmit())
            }
        }, 1/this.tickRate*1000)
    }

    logPlayers() {
        console.log('[INFO] Online players : ' + this.PLAYERS.size)
    }

    preparePlayersToEmit(socketId) {
        let toSend = []
        let i = 0
        for (const [socket, socketHandler] of this.PLAYERS) {
            if (socket.id !== socketId) {
                toSend[i] = {}
                toSend[i].socketId = socket.id
                toSend[i].position = socketHandler.position
                toSend[i].direction = socketHandler.direction
                toSend[i].color = socketHandler.color
            }
            i++
        }
        return toSend
    }

}