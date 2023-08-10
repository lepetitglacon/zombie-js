
export default class GameEngine extends EventTarget {

    static STATE = {
        MENU: 0,
        OPTION: 1,
        GAME: 2,
        CHAT: 3,
        LOBBY: 4,
    }

    constructor({socket}) {
        super();

        this.socket = socket
        socket.connect()
        console.log('[ENGINE] start with socket ' + socket.id)

        socket.emit('ping', {timestamp: Date.now()})
        socket.on('ping', onPing)

        function onPing(e) {
            console.log('ping: ' + e.delay + ' ms')
        }
    }
}