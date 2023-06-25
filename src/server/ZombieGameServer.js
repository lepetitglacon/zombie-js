import express from 'express'
import http from 'http'
import cors from 'cors'
import os from "os"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {Server} from "socket.io";
import Routes from "./routes/Routes.js";
import Game from "./service/Game.js";
import PlayerFactory from "../common/factory/PlayerFactory.js";
import passport from "passport";
import {OAuth2Strategy} from "passport-google-oauth";
import session from "express-session";


import dotenv from 'dotenv'
import SocketRequestHandler from "./service/socket/SocketRequestHandler.js";
import DatabaseHandler from "./database/DatabaseHandler.js";
dotenv.config()



export default class ZombieGameServer {

    constructor() {
        this.__filename = fileURLToPath(import.meta.url);
        this.__dirname = dirname(this.__filename);

        this.isOnlineMode = false

        this.port = 3000
        this.app = express()
        this.server = http.createServer(this.app)
        this.io = new Server(this.server);

        // this.dbHandler = new DatabaseHandler()
        // this.dbHandler.init().then(r => console.log('[DB] connected'))

        this.GAMES = new Map()

        this.app.use(cors())
        this.app.use(express.static('dist/src/client/assets'));
        this.app.use('/game', express.static('dist'));

        this.app.set('view engine', 'ejs');
        this.app.set('views', this.__dirname + '\\vue\\');

        this.app.use(session({
            name: 'z3d-connect',
            resave: false,
            saveUninitialized: true,
            secret: 'z3d-secret' // process.env.GOOGLE_CLIENT_SECRET
        }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        this.passport = passport;
        this.googleStrategy = OAuth2Strategy;

        this.passport.serializeUser(function(user, done) {
            done(null, user);
        });
        this.passport.deserializeUser(function(user, done) {
            done(null, user);
        });

        this.createGame({
            name:'TEST',
            map:'flora_square.glb',
            private: false
        })
    }

    run() {
        this.routes = new Routes()


        this.getAvailableNetworks()
        this.server.listen(this.port, () => {
            console.log()
            console.log("----------------------------")
            console.log(`Zombie server listening port ${this.port}`)
            console.log(`Join a game here http://localhost:${this.port}`)
            console.log(`Join a game here http://${this.ipAddresses.values().next().value}:${this.port}`)
            console.log("----------------------------")
            console.log()

            this.io.on('connection', (socket) => {

                const srh = new SocketRequestHandler({
                    server: this,
                    socket: socket
                })

            });
        })
    }

    createGame(props) {
        let id = this.getRandomId(10)

        let game = new Game({roomId: id, server: this.io, map: props.map, online: this.isOnlineMode})
        game.name = props.name
        game.private = props.private
        game.owner = props.owner ?? null

        this.GAMES.set(id, game)

        console.log('[GAME] created ' + id + ' on map ' + props.map)
        return id
    }

    startGame(gameId) {
        if (this.GAMES.has(gameId)) {
            const game = this.GAMES.get(gameId)
            if (game.status !== Game.STATUS.RUNNING) {
                game.run()
            }
            return true
        } else {
            return false
        }
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

    getAvailableNetworks() {
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




