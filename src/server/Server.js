import express from 'express'
import http from 'http'
import cors from 'cors'
import os from "os"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {Server as SocketServer} from "socket.io";
import RoutesHandler from "./routes/RoutesHandler.js";
import Game from "./services/game/Game.js";
import passport from "passport";
import session from "express-session";

import dotenv from 'dotenv'
import SocketRequestHandler from "./services/game/socket/SocketRequestHandler.js";
import DatabaseHandler from "./database/DatabaseHandler.js";

dotenv.config()

export default class Server {

    static __filename = fileURLToPath(import.meta.url);
    static __dirname = dirname(this.__filename);

    constructor(props) {
        console.log('[SERVER] Starting server')
        this.configuration = props
        this.isOnlineMode = props.online ?? false

        this.port = 3000
        this.app = express()
        this.server = http.createServer(this.app)
        this.io = new SocketServer(this.server);

        this.GAMES = new Map()
        this.USERS = new Map()

        this.app.use(cors())
        // this.app.use(express.static('dist/src/client/assets'));
        // this.app.use('/', express.static(Server.__dirname + '/resources'));
        this.app.use('/game', express.static('dist'));
        this.app.use('/game/assets', express.static(Server.__dirname + '/resources'));

        this.app.set('view engine', 'ejs');
        this.app.set('views', Server.__dirname + '/views/');

        this.app.use(session({
            name: 'z3d-connect',
            resave: false,
            saveUninitialized: true,
            secret: 'z3d-secret' // process.env.GOOGLE_CLIENT_SECRET
        }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        this.passport = passport;

        this.passport.serializeUser(function(user, done) {
            done(null, user);
        });
        this.passport.deserializeUser(function(user, done) {
            done(null, user);
        });

        this.createGame({
            name:'TEST',
            private: false
        })
    }

    async run() {
        this.dbHandler = await new DatabaseHandler(this.configuration)
        await this.dbHandler.connect()

        new RoutesHandler()

        await this.getAvailableNetworks_()

        this.server.listen(this.port, () => {
            console.log()
            console.log(`Z3D Server`)
            console.log("----------------------------")
            console.log(`Join a game here http://localhost:${this.port}`)
            console.log(`Join a game here http://${this.ipAddresses.values().next().value}:${this.port}`)
            console.log("----------------------------")
            console.log()

            this.io.on('connection', (socket) => {
                new SocketRequestHandler({
                    server: this,
                    socket: socket
                })
            });
        })
    }

    /**
     * Create a game (lobby)
     * @param props
     * @returns {string}
     */
    createGame(props) {
        let id = this.getRandomId_(10)

        let game = new Game({
            name: props.name,
            private: props.private,
            ownerId: props.ownerId ?? null,
            map: props.map,
            roomId: id,
            server: this.io,
            online: this.isOnlineMode
        })

        this.GAMES.set(id, game)

        console.log('[GAME] created ' + id + ' on map ' + props.map)
        return id
    }

    /**
     * Starts the game if exists
     * @returns {boolean}
     * @param props
     */
    startGame(props) {
        if (this.GAMES.has(props.gameId)) {
            const game = this.GAMES.get(props.gameId)
            game.mapName = props.mapName

            if (game.status !== Game.STATUS.RUNNING) {
                game.run()
            }
            return true
        } else {
            return false
        }
    }

    /**
     * Delete a game
     * @param gameId
     */
    deleteGame(gameId) {
        if (this.GAMES.has(gameId)) {
            this.GAMES.delete(gameId)
        }
    }

    getRandomId_(length = 10) {
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

    async getAvailableNetworks_() {
        const nets = os.networkInterfaces();
        this.ipAddresses = new Map();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    if (!this.ipAddresses.has(name)) {
                        this.ipAddresses.set(name, net.address);
                    }
                }
            }
        }
    }
}




