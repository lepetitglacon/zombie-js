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

        this.setPlayers()

        this.serverConnector.socket.on('connect', () => {
            console.table(['[SOCKET] connected'])
        })

        let btn = document.getElementById('lobby-start_game')
        if (btn !== null) {
            let url = btn.dataset.url
            btn.addEventListener("click", (e) => {
                e.preventDefault()
                fetch(url)
            })
        }

        let btnReady = document.getElementById('lobby-player-ready')
        if (btnReady !== null) {
            btnReady.addEventListener("click", (e) => {
                e.preventDefault()
                this.serverConnector.socket.emit('lobby-player-ready', {
                    ready: btnReady.dataset.ready
                })
                btnReady.dataset.ready = (!btnReady.dataset.ready).toString()
            })
        }

        this.serverConnector.socket.on('lobby-map-change', (e) => {
            if (e.direction === 'left') {
                $('#lobby-main-map-carousel').carousel('next')
                this.serverConnector.socket.emit('lobby-map-change', {
                    e
                })
            } else {
                $('#lobby-main-map-carousel').carousel('prev')
            }
        })

        this.serverConnector.socket.on('game-state', (stateObj) => {
            if (stateObj.state === Game.STATUS.RUNNING) {
                console.log('[GAME] game already started on map : ' + stateObj.mapName)
                this.modelManager.registerModel('map', '../gltf/maps/' + stateObj.mapName)
                this.engine.init()
            } else {
                console.log('[GAME] game has not started yet')
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

        $('#lobby-map-carousel').on('slide.bs.carousel', (e) => {
            console.log(e)
            if (e.direction === 'left') {
                $('#lobby-main-map-carousel').carousel('next')
                this.serverConnector.socket.emit('lobby-map-change', e)
            } else {
                $('#lobby-main-map-carousel').carousel('prev')
                this.serverConnector.socket.emit('lobby-map-change', e)
            }
        })

        // send lobby players to socket
        this.serverConnector.socket.emit('lobby-ready')
    }

    setPlayers() {
        const playerUl = document.getElementById('lobby-players-list')
        playerUl.innerHTML = ''

        this.serverConnector.socket.on('get_players', (players) => {
            console.log('[LOBBY] player already connected : ', players)
            for (const player of players) {
                this.createPlayerLi(player, playerUl)
            }
        })

        this.serverConnector.socket.on('player_connect', (player) => {
            console.log('[LOBBY] player connected : ' + player.socketId)
            this.createPlayerLi(player, playerUl)

        })

        this.serverConnector.socket.on('player_disconnect', (socketId) => {
            console.log('player disconnected')
            const li = document.getElementById('lobby-player-' + socketId)
            console.log(li)
            if (li !== null) {
                li.remove()
            }
        })

        this.serverConnector.socket.emit('lobby_players')
    }

    hide() {
        document.getElementById('lobby').classList.toggle('d-none')
    }

    createPlayerLi(player, playerUl) {
        const li = document.createElement('li')
        li.innerText = player.socketId //player.username
        li.id = 'lobby-player-' + player.socketId
        li.classList.add('lobby-player')

        let hexa = player.color.toString(16).toUpperCase();
        li.style.color = '#' + hexa

        playerUl.append(li)
    }

}