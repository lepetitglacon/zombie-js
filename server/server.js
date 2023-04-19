// imports
import express from 'express'
import http from 'http'
import cors from 'cors'
import path from "path"
import { Server } from "socket.io"
import SocketHandler from "./SocketHandler.js"

// conf
const port = 3000
const tickRate = 60

// objects
const app = express()
const server = http.createServer(app)
const io = new Server(server);

const PLAYERS = new Map()
const ZOMBIES = new Map()

app.use(cors())
app.use(express.static('dist'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
})

io.on('connection', (socket) => {
    console.log(`[CONNECT] ${socket.id} just connected`);

    // adding socket to players
    PLAYERS.set(socket, new SocketHandler(socket))

    // tell other player the new connection
    socket.broadcast.emit('player_connect', {
        socketId: socket.id,
        color: PLAYERS.get(socket).color
    })

    // send players to socket
    if (PLAYERS.size > 1) {
        socket.emit('get_players', preparePlayersToEmit(socket.id))
    }

    // disconnect
    socket.on('disconnect', () => {
        if (PLAYERS.has(socket)) {
            socket.broadcast.emit('player_disconnect', socket.id)
            PLAYERS.delete(socket)
            console.log(`[DISCONNECT] ${socket.id} disconnected`);
            logPlayers()
        }
    })

    logPlayers()
});

server.listen(port, () => {
    console.log()
    console.log("----------------------------")
    console.log(`Zombie server listening port ${port}`)
    console.log(`Join a game here http://localhost:${port}`)
    console.log("----------------------------")
    console.log()

    setInterval(() => {
        if (PLAYERS.size > 1) {
            io.emit('players_position', preparePlayersToEmit())
        }
    }, 1/tickRate*1000)
})

function logPlayers() {
    console.log('[INFO] Online players : ' + PLAYERS.size)
}

function preparePlayersToEmit(socketId) {
    let toSend = []
    let i = 0
    for (const [socket, socketHandler] of PLAYERS) {
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
