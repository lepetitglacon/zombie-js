import ServerConnector from "./ServerConnector.js";
import GameEngine from "../GameEngine.js";
import Game from "../Game.js";

export default class Lobby {

    constructor(loader, sc, mm, engine) {
        this.loader = loader
        this.serverConnector = sc
        this.modelManager = mm
        this.engine = engine
    }

    run() {
        this.loader.hide()

        let btn = document.getElementById('lobby-start_game')
        if (btn !== null) {
            let url = btn.dataset.url
            btn.addEventListener("click", (e) => {
                e.preventDefault()
                fetch(url)
            })
        }


        let btnReady = document.getElementById('lobby-ready')
        if (btnReady !== null) {
            btnReady.addEventListener("click", (e) => {
                e.preventDefault()
                this.serverConnector.socket.emit('lobby-ready', {
                    ready: btnReady.dataset.ready
                })
                btnReady.dataset.ready = (!btnReady.dataset.ready).toString()
            })
        }

        this.serverConnector.socket.on('game-state', (stateObj) => {
            if (stateObj.state === Game.STATUS.RUNNING) {
                console.log('[GAME] game already started on map : ' + stateObj.mapName)
                this.modelManager.registerModel('map', '../gltf/maps/' + stateObj.mapName)
                this.engine.init()
            }
        })
        this.serverConnector.socket.emit('game-state')

        this.serverConnector.socket.on('game_load', (mapObject) => {
            if (this.engine.state === GameEngine.STATE.LOBBY) {
                console.log('[GAME] host started the game on map : ' + mapObject.mapName)
                this.modelManager.registerModel('map', '../gltf/maps/' + mapObject.mapName)
                this.engine.init()
            }

        })
    }

    hide() {
        document.getElementById('lobby').classList.toggle('d-none')
    }

}