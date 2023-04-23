import express from 'express'
import http from 'http'
import cors from 'cors'
import path from "path"
import os from "os"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {Server} from "socket.io";
import Routes from "./routes/Routes.js";
import ClientConnector from "./ClientConnector.js";
import Game from "./Game.js";

const nets = os.networkInterfaces();
const ipAddresses = new Map();
for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!ipAddresses.has(name)) {
                ipAddresses.set(name, net.address);
            }
        }
    }
}

export default class ZombieGameServer {

    constructor() {
        this.__filename = fileURLToPath(import.meta.url);
        this.__dirname = dirname(this.__filename);


        this.port = 3000
        this.app = express()
        this.server = http.createServer(this.app)
        this.io = new Server(this.server);



        this.GAMES = new Map()
        //createGame('TEST')

    }

    init() {
        this.app.use(cors())
        this.app.use(express.static('dist/src/client/assets'));
        this.app.use('/game', express.static('dist'));
        this.routes = new Routes()

    }

    run() {

        this.server.listen(this.port, () => {
            console.log()
            console.log("----------------------------")
            console.log(`Zombie server listening port ${this.port}`)
            console.log(`Join a game here http://localhost:${this.port}`)
            console.log(`Join a game here http://${ipAddresses.values().next().value}:${this.port}`)
            console.log("----------------------------")
            console.log()

            this.io.on('connection', (socket) => {
                let query = socket.handshake.query;
                let roomName = query.roomName;
                if (this.GAMES.has(roomName)) {
                    const game = this.GAMES.get(roomName)
                    game.PLAYERS.set(socket, new ClientConnector(socket, roomName))

                    socket.join(roomName)

                    // tell other player the new connection
                    socket.to(roomName).emit('player_connect', {
                        socketId: socket.id,
                        color: game.PLAYERS.get(socket).color
                    })

                    // send players to socket
                    if (game.PLAYERS.size > 1) {
                        socket.emit('get_players', game.preparePlayersToEmit())
                    }

                    // disconnect
                    socket.on('disconnect', () => {
                        if (game.PLAYERS.has(socket)) {
                            socket.to(roomName).emit('player_disconnect', socket.id)
                            game.PLAYERS.delete(socket)
                            console.log(`[DISCONNECT] ${socket.id} disconnected`);
                        }
                    })

                }
            });
        })
    }

    createGame(name = '') {
        let id = this.getRandomId(10)
        console.log('[GAME] created ' + id)
        let game = new Game(id, this.io)
        game.name = name
        this.GAMES.set(id, game)
        game.run()
        return id
    }

    getRandomId(length = 10) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
}




