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
        this.buildMapSelector()

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

        this.serverConnector.socket.on('game-state', (stateObj) => {
            if (stateObj.state === Game.STATUS.RUNNING) {
                console.log('[GAME] game already started on map : ' + stateObj.mapName)
                this.modelManager.registerModel('map', 'assets/gltf/maps/' + stateObj.mapName)
                this.engine.init()
            } else {
                console.log('[GAME] game has not started yet')
            }
        })

        this.serverConnector.socket.emit('game-state')

        this.serverConnector.socket.on('game_load', (mapObject) => {
            if (this.engine.state === GameEngine.STATE.LOBBY) {
                console.log('[GAME] host started the game on map : ' + mapObject.mapName)
                this.modelManager.registerModel('map', 'assets/gltf/maps/' + mapObject.mapName)
                this.engine.init()
            }
        })

        this.serverConnector.socket.on('lobby-map-change', (e) => {
            $('#lobby-map-name').text(e.mapName)
            if (e.direction === 'left') {
                $('#lobby-main-map-carousel').carousel('next')
            } else {
                $('#lobby-main-map-carousel').carousel('prev')
            }
        })

        const $carousel = $('#lobby-map-carousel')
        $carousel.on('slide.bs.carousel', (e) => {
            let active

            if (e.direction === 'left') {
                $('#lobby-main-map-carousel').carousel('next')
                if ($('#lobby-map-carousel .active').next().length === 0) {
                    active = $('#lobby-map-carousel .active').parent().children().first()
                } else {
                    active = $('#lobby-map-carousel .active').next()
                }
            } else {
                $('#lobby-main-map-carousel').carousel('prev')
                if ($('#lobby-map-carousel .active').prev().length === 0) {
                    active = $('#lobby-map-carousel .active').parent().children().last()
                } else {
                    active = $('#lobby-map-carousel .active').prev()
                }
            }

            console.log(active.data('mapName'))
            $('#lobby-map-name').text(active.data('mapName'))

            this.serverConnector.socket.emit('lobby-map-change', {
                direction: e.direction,
                mapName: active.data('mapName')
            })
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

    async buildMapSelector() {
        const res = await fetch('/lp/maps')
        const maps = await res.json()

        for (const map of maps) {

        }
    }

    hide() {
        document.getElementById('lobby').classList.toggle('d-none')
    }

    createPlayerLi(player, playerUl) {
        const li = document.createElement('li')
        li.innerText = player.gamename ?? player.username
        li.id = 'lobby-player-' + player.socketId
        li.classList.add('lobby-player')

        let hexa = player.color.toString(16).toUpperCase();
        li.style.color = '#' + hexa

        playerUl.append(li)
    }

}