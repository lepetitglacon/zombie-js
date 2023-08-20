import express from 'express'
import http from 'http'
import os from "os"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {Server as SocketServer} from "socket.io";
import RoutesHandler from "./routes/RoutesHandler.js";

import dotenv from 'dotenv'
import SocketRequestHandler from "./socket/SocketRequestHandler.js";
import DatabaseHandler from "./database/DatabaseHandler.js";
import GameManager from "./controllers/GameManager.js";
import Logger from "./Logger.js";

export default class Server {

    static __filename = fileURLToPath(import.meta.url);
    static __dirname = dirname(this.__filename);

    static __port = 39000
    static __assetsPath = `http://localhost:${Server.__port}/`;

    static VIEWS = {
        BACKEND: '/views/',
        FRONTEND: '../../dist/'
    }

    constructor(props) {
        Logger.server('Starting server')
        dotenv.config()

        this.configuration = props
        this.isOnlineMode = props.online ?? false

        this.app = express()
        this.server = http.createServer(this.app)
        this.io = new SocketServer(this.server, {
            cors: {
                origin: "http://localhost:3000",
                credentials: true
            }
        });

        this.dbHandler = new DatabaseHandler(this.configuration)
        this.gameManager = new GameManager({server: this})
    }

    async run() {
        await this.dbHandler.connect()
        await this.gameManager.init()

        new RoutesHandler({
            server: this
        })

        await this.getAvailableNetworks_()

        this.server.listen(Server.__port, () => {
            console.log()
            console.log(`Z3D Server`)
            console.log("----------------------------")
            console.log(`Join a game here http://localhost:${Server.__port}`)
            console.log(`Join a game here http://${this.ipAddresses.values().next().value}:${Server.__port}`)
            console.log("----------------------------")
            console.log()

            this.io.on('connection', (socket) => {
                this.gameManager.connect(socket)
            })
        })
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




