import express from 'express'
import http from 'http'
import cors from 'cors'
import path from "path"
import os from "os"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Game from "./server/Game.js";
import {Server} from "socket.io";
import ClientConnector from "./server/ClientConnector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// conf
const port = 3000

// objects
const app = express()
const server = http.createServer(app)
const io = new Server(server);

app.use(cors())
app.use(express.static('dist/src/client/assets'));
app.use('/game', express.static('dist'));

const GAMES = new Map()
createGame('TEST')

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/server/html/LandingPage.html'));
})

app.get('/lp/refresh', (req, res) => {

    const games = []

    let i = 0;
    for (const [key, val] of GAMES) {
        games[i] = {}
        games[i].id = key
        games[i].name = val.name ?? 'Untitled'
        games[i].map = val.map
        games[i].players = val.PLAYERS.size
        games[i].ping = 25
        i++
    }

    res.json(games);
})

// create game
app.get('/create/:name', (req, res) => {
    res.redirect(`/game/${createGame(req.params.name)}`)
})

// play game
app.get('/game/:id', (req, res) => {
    if (GAMES.has(req.params.id)) {
        res.sendFile(path.join(__dirname, '/../dist/index.html'));
    } else {
        res.redirect('/')
    }
})

server.listen(port, () => {
    console.log()
    console.log("----------------------------")
    console.log(`Zombie server listening port ${port}`)
    console.log(`Join a game here http://localhost:${port}`)
    console.log(`Join a game here http://${ipAddresses.values().next().value}:${port}`)
    console.log("----------------------------")
    console.log()

    io.on('connection', function(socket) {
        let query = socket.handshake.query;
        let roomName = query.roomName;
        if (GAMES.has(roomName)) {
            GAMES.get(roomName).PLAYERS.set(socket, new ClientConnector(socket, roomName))
        }
    });

})

function createGame(name = '') {
    let id = getRandomId(10)
    console.log('[GAME] created ' + id)
    let game = new Game(server, id)
    game.name = name
    GAMES.set(id, game)
    return id
}

function getRandomId(length = 10) {
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




