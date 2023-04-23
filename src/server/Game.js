export default class Game {

    static STATUS = {
        PAUSED: 0,
        RUNNING: 1,
    }

    constructor(roomId, server) {
        this.io = server
        this.tickRate = 30
        this.status = Game.STATUS.PAUSED
        this.roomId = roomId

        this.name = ''

        this.PLAYERS = new Map()
        this.ZOMBIES = new Map()
    }

    run() {
        this.status = Game.STATUS.RUNNING
        setInterval(() => {
            if (this.PLAYERS.size > 1) {
                this.io.to(this.roomId).emit('players_position', this.preparePlayersToEmit())
            }
        }, 1/this.tickRate*1000)
    }

    logPlayers() {
        console.log('[INFO] Online players : ' + this.PLAYERS.size)
    }

    preparePlayersToEmit() {
        let toSend = []
        let i = 0
        for (const [socket, socketHandler] of this.PLAYERS) {
            toSend[i] = {}
            toSend[i].socketId = socket.id
            toSend[i].position = socketHandler.position
            toSend[i].direction = socketHandler.direction
            toSend[i].color = socketHandler.color
            i++
        }
        return toSend
    }

}