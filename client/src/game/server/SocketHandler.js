import ZombieEvents from "./events/ZombieEvents";
import PlayerEvents from "./events/PlayerEvents";

export default class SocketHandler {

    constructor({engine, socket, gameId}) {
        this.engine = engine
        this.gameId = gameId
        this.socket = socket

        this.socket.connect()
        this.socket.emit('ping', {timestamp: Date.now()})
        this.socket.emit('gameInstance-init')

        this.zombieEvents = new ZombieEvents({engine: this.engine, socket: this.socket})
        this.playerEvents = new PlayerEvents({engine: this.engine, socket: this.socket})

        console.log('[ENGINE] start with socket ' + this.socket.id)
        this.bind()
    }

    update() {
    }

    bind() {
        this.zombieEvents.bind()
        this.playerEvents.bind()


        this.socket.on('ping', (e) => {
            console.log('ping: ' + e.delay + ' ms')
        })

        this.socket.on('loading-connected', () => {
            this.dispatchEventToEngine_('loading-connected')
            console.log('connected to game instance')
        })
        this.socket.on('loading-assets', (e) => {
            this.dispatchEventToEngine_('loading-assets', e)
            console.log('need to load assets', e)
        })
        this.socket.on('game-start', () => {
            this.dispatchEventToEngine_('game-start')
        })

    }

    dispatchEventToEngine_(eventName, data = {}) {
        const event = new Event(eventName)
        Object.assign(event, data)
        this.engine.dispatchEvent(event)
    }

    emitToServer(eventName, data) {
        this.socket.emit(eventName, data)
    }

}