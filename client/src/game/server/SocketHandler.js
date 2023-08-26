import ZombieEvents from "./events/ZombieEvents";
import PlayerEvents from "./events/PlayerEvents";
import GameEvents from "./events/GameEvents";

export default class SocketHandler {

    constructor({engine, socket, gameId}) {
        this.engine = engine
        this.gameId = gameId
        this.socket = socket

        this.socket.connect()
        this.socket.emit('ping', {timestamp: Date.now()})
        this.socket.emit('game:init:client_game_instance-ready-for-init')

        this.zombieEvents = new ZombieEvents({engine: this.engine, socket: this.socket})
        this.playerEvents = new PlayerEvents({engine: this.engine, socket: this.socket})
        this.gameEvents = new GameEvents({engine: this.engine, socket: this.socket})

        console.log('[ENGINE] start with socket ' + this.socket.id)
        this.bind()
    }

    update() {
    }

    bind() {
        this.zombieEvents.bind()
        this.playerEvents.bind()
        this.gameEvents.bind()

        this.socket.on('ping', (e) => {
            console.log('ping: ' + e.delay + ' ms')
        })

        this.socket.on('game:init:loading-connected', () => {
            this.dispatchEventToEngine_('game:init:loading-connected')
        })
        this.socket.on('game:init:assets_to_load', (e) => {
            this.dispatchEventToEngine_('game:init:assets_to_load', e)
        })
        this.socket.on('game:init:game-start', () => {
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