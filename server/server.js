// imports
import express from 'express'
import http from 'http'
import cors from 'cors'
import path from "path"
import { Server } from "socket.io"
import SocketHandler from "./SocketHandler.js"

// conf
const port = 3000
const tickRate = 30

// objects
const app = express()
const server = http.createServer(app)
const io = new Server(server);

const PLAYERS = new Map()

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
    socket.broadcast.emit('player_connect', socket.id)

    // send players to socket
    if (PLAYERS.size > 1) {
        socket.emit('get_players', preparePlayersToEmit(socket.id))
    }

    socket.on('position', (pos) => {
        PLAYERS.get(socket).position.x = pos.x
        PLAYERS.get(socket).position.z = pos.z
    })

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
    console.log('Online players ' + PLAYERS.size)
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
        }
        i++
    }
    return toSend
}
