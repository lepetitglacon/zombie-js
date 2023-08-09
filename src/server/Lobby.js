/*eslint no-inline-comments: "error"*/

// import ServerConnector from "./ServerConnector.js";
// import GameEngine from "../GameEngine.js";
// import Game from "../Game.js";

export default class Lobby {

    // constructor(loader, sc, mm, engine) {
    //     this.loader = loader
    //     this.serverConnector = sc
    //     this.modelManager = mm
    //     this.engine = engine
    // }
    //
    // run() {
    //     this.loader.hide()
    //
    //     this.setPlayers()
    //
    //     this.serverConnector.socket.on('connect', () => {
    //         console.table(['[SOCKET] connected'])
    //     })
    //
    //     let btnLeave = document.getElementById('lobby-leave')
    //     if (btnLeave !== null) {
    //         btnLeave.addEventListener("click", (e) => {
    //             this.serverConnector.socket.disconnect()
    //         })
    //     }
    //
    //     let btn = document.getElementById('lobby-start_game')
    //     if (btn !== null) {
    //         btn.addEventListener("click", async (e) => {
    //             e.preventDefault()
    //
    //             let gameId = btn.dataset.gameId
    //             let mapName = $('#lobby-map-carousel .active')[0].dataset.mapFilename
    //
    //             console.log(mapName)
    //
    //             const res = await fetch('/game/start', {
    //                 method: 'POST',
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify({
    //                     gameId: gameId,
    //                     mapName: mapName
    //                 })
    //             })
    //             const data = await res.json()
    //         })
    //     }
    //
    //     let btnReady = document.getElementById('lobby-player-ready')
    //     if (btnReady !== null) {
    //         btnReady.addEventListener("click", (e) => {
    //             e.preventDefault()
    //             this.serverConnector.socket.emit('lobby-player-ready', {
    //                 ready: btnReady.dataset.ready
    //             })
    //             btnReady.dataset.ready = (!btnReady.dataset.ready).toString()
    //         })
    //     }
    //
    //     this.serverConnector.socket.on('game-state', (stateObj) => {
    //         if (stateObj.state === Game.STATUS.RUNNING) {
    //             console.log('[GAME] game already started on map : ' + stateObj.mapName)
    //             this.modelManager.registerModel('map', 'assets/gltf/maps/' + stateObj.mapName)
    //             this.engine.init()
    //         } else {
    //             console.log('[GAME] game has not started yet')
    //         }
    //     })
    //
    //     this.serverConnector.socket.emit('game-state')
    //
    //     this.serverConnector.socket.on('game_load', (mapObject) => {
    //         if (this.engine.state === GameEngine.STATE.LOBBY) {
    //             console.log('[GAME] host started the game on map : ' + mapObject.mapName)
    //             this.modelManager.registerModel('map', 'assets/gltf/maps/' + mapObject.mapName)
    //             this.engine.init()
    //         }
    //     })
    //
    //     this.serverConnector.socket.on('lobby-map-change', (e) => {
    //         $('#lobby-map-name').text(e.mapName)
    //         if (e.direction === 'left') {
    //             $('#lobby-main-map-carousel').carousel('next')
    //         } else {
    //             $('#lobby-main-map-carousel').carousel('prev')
    //         }
    //     })
    //
    //     const $carousel = $('#lobby-map-carousel')
    //     $carousel.on('slide.bs.carousel', (e) => {
    //         let active
    //
    //         if (e.direction === 'left') {
    //             $('#lobby-main-map-carousel').carousel('next')
    //             if ($('#lobby-map-carousel .active').next().length === 0) {
    //                 active = $('#lobby-map-carousel .active').parent().children().first()
    //             } else {
    //                 active = $('#lobby-map-carousel .active').next()
    //             }
    //         } else {
    //             $('#lobby-main-map-carousel').carousel('prev')
    //             if ($('#lobby-map-carousel .active').prev().length === 0) {
    //                 active = $('#lobby-map-carousel .active').parent().children().last()
    //             } else {
    //                 active = $('#lobby-map-carousel .active').prev()
    //             }
    //         }
    //
    //         console.log(active.data('mapName'))
    //         $('#lobby-map-name').text(active.data('mapName'))
    //
    //         this.serverConnector.socket.emit('lobby-map-change', {
    //             direction: e.direction,
    //             mapName: active.data('mapName')
    //         })
    //     })
    //
    //
    //
    //     // send lobby players to socket
    //     this.serverConnector.socket.emit('lobby-ready')
    // }
    //
    // setPlayers() {
    //     const playerUl = document.getElementById('lobby-players-list')
    //     playerUl.innerHTML = ''
    //
    //
    //
    //     this.serverConnector.socket.emit('lobby_players')
    // }
    //
    // hide() {
    //     document.getElementById('lobby').classList.toggle('d-none')
    // }



}