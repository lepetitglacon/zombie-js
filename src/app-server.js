// imports
import express from 'express'
import http from 'http'
import cors from 'cors'
import path from "path"
import os from "os"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Game from "./server/Game.js";

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

console.log('')

// conf
const port = 3000

// objects
const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.static('src'))

const GAMES = new Map()

app.get('/', (req, res) => {
    console.log('root')
    res.sendFile(path.join(__dirname, '/../dist/home.html'));
})

app.get('/game/:id', (req, res) => {
    console.log(req.params.id)
    res.sendFile(path.join(__dirname, '/../dist/index.html'));
})

app.get('/create', (req, res) => {
    console.log('create game')
    let id = getRandomId(10)
    let game = new Game(server)
    GAMES.set(id, game)
    res.redirect(`/game/${id}`)
})

server.listen(port, () => {
    console.log()
    console.log("----------------------------")
    console.log(`Zombie server listening port ${port}`)
    console.log(`Join a game here http://localhost:${port}`)
    console.log(`Join a game here http://${ipAddresses.values().next().value}:${port}`)
    console.log("----------------------------")
    console.log()
})

function getRandomId(length) {
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




