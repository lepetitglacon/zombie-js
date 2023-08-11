// import * as THREE from "three";
// import Player from "../mob/Player.js";
// import ZombieFactory from "../../../server/services/game/mob/ZombieFactory.js";
// import Utils from "../../../server/Utils.js";
// import ZombieEvents from "./events/ZombieEvents.js";
// import Zombie from "../mob/Zombie.js";

export default class ServerConnector {

    // static roomId = window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
    // static userId = document.getElementById('userId').value ?? 'offline'
    // static socket = io({
    //     query: {
    //         roomId: ServerConnector.roomId,
    //         userId: ServerConnector.userId,
    //     },
    // });
    //
    // constructor() {
    //     this.roomId = ServerConnector.roomId
    //     this.socket = ServerConnector.socket
    //
    //     this.socket.on("connect", () => {
    //         console.log('[SOCKET] connected to room : ' + this.roomId)
    //
    //         this.zombieEvents = new ZombieEvents(this)
    //
    //
    //     })
    // }
    //
    // init() {
    //     this.engine = window.ZombieGame
    //     this.zombieEvents.init()
    //
    //     // receive map info
    //     this.socket.on('map', (mapName) => {
    //         this.engine.modelManager.registerModel('map', 'assets/gltf/maps/' + mapName)
    //     })
    //
    //     // On game start
    //     window.addEventListener('z3d-game-start', () => {
    //
    //         this.socket.emit('ready')
    //
    //         // // player points
    //         this.socket.on('points', (playerPoints) => {
    //             this.engine.points.update(playerPoints)
    //         })
    //
    //         // wave update
    //         this.socket.on('wave_update', (waveObj) => {
    //             console.log('[WAVE] ', waveObj.wave)
    //             this.engine.waveGui.setWave(waveObj.wave)
    //         })
    //
    //         // player name
    //         this.socket.on('player_name', (id, username) => {
    //             if (this.engine.game.PLAYERS.has(id)) {
    //                 this.engine.game.PLAYERS.get(id).username = username
    //             }
    //         })
    //
    //         // chat message
    //         this.socket.on('chat', (msg, from) => {
    //             console.log('[CHAT] message from ', from)
    //             Utils.addMessageToChat(this.engine.chat, msg, from)
    //         })
    //
    //         // get messages for the first time
    //         this.socket.on('get_chat_messages', (messages) => {
    //             console.log('[CHAT] Messages already sent ', messages)
    //             for (const i in messages) {
    //                 const msg = messages[i]
    //                 Utils.addMessageToChat(this.engine.chat, msg.message, msg.from)
    //             }
    //         })
    //
    //         // get players for the first time
    //         this.socket.on('get_players', (players) => {
    //             console.log('[PLAYERS] Players allready connected ', players)
    //             for (const i in players) {
    //                 if (players[i].socketId !== this.socket.id) {
    //                     this.engine.game.PLAYERS.set(players[i].socketId, new Player(players[i]))
    //                 }
    //             }
    //         })
    //
    //         // get zombies for the first time
    //         this.socket.on('get_zombies', (zombies) => {
    //             console.log('[ZOMBIES] Zombies already spawned ', zombies)
    //             for (const i in zombies) {
    //                 if (!this.engine.game.ZOMBIES.get(zombies[i].id)) {
    //                     this.engine.game.ZOMBIES.set(zombies[i].id, new Zombie(zombies[i]))
    //                 }
    //             }
    //         })
    //
    //         /**
    //          * Get opened doors for the first time
    //          */
    //         this.socket.on('get_opened_door', (doors) => {
    //             console.log('[DOORS] Doors already opened ', doors)
    //             for (const [doorId, door] of doors) {
    //                 console.log('[DOORS] remove '+ doorId)
    //                 if (this.engine.game.three.DOORS.has(doorId)) {
    //                     this.engine.game.three.DOORS.get(doorId).isOpen = true
    //
    //                     this.engine.game.three.DOORS.get(doorId).remove_()
    //                     this.engine.soundManager.play('door-buy')
    //                 }
    //             }
    //         })
    //
    //         // get a new player that just connected
    //         this.socket.on('player_connect', (player) => {
    //             console.log('[CONNECT] Player ' + player.socketId + ' connected')
    //             const p = new Player(player)
    //             this.engine.game.PLAYERS.set(player.socketId, p)
    //         })
    //         // get a new player that just connected
    //         this.socket.on('player_disconnect', (socketId) => {
    //             console.log('[DISCONNECT] Player ' + socketId + ' disconnected')
    //             this.engine.game.PLAYERS.get(socketId).removeFromScene()
    //             this.engine.game.PLAYERS.delete(socketId)
    //         })
    //
    //         // get players position (update game state)
    //         this.socket.on('players_position', (playerList) => {
    //             for (const i in playerList) {
    //                 if (playerList[i].socketId !== this.socket.id) {
    //                     if (this.engine.game.PLAYERS.has(playerList[i].socketId)) {
    //                         let p = this.engine.game.PLAYERS.get(playerList[i].socketId)
    //                         p.mesh.position.set(playerList[i].position.x, playerList[i].position.y, playerList[i].position.z)
    //
    //                         let angle = Math.atan2(playerList[i].direction.z,playerList[i].direction.x)
    //                         p.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI/2))
    //
    //                         if (p.gltf !== undefined) {
    //                             p.gltf.position.set(playerList[i].position.x, playerList[i].position.y - 1, playerList[i].position.z)
    //                             p.gltf.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI/2))
    //
    //                             // update sounds
    //                             p.sound.getOutput().positionX.setValueAtTime(
    //                                 playerList[i].position.x ,
    //                                 0
    //                             )
    //                             p.sound.getOutput().positionZ.setValueAtTime(
    //                                 playerList[i].position.z ,
    //                                 0
    //                             )
    //                             p.knifeSound.getOutput().positionX.setValueAtTime(
    //                                 playerList[i].position.x ,
    //                                 0
    //                             )
    //                             p.knifeSound.getOutput().positionZ.setValueAtTime(
    //                                 playerList[i].position.z ,
    //                                 0
    //                             )
    //                         }
    //                     }
    //                 }
    //             }
    //         })
    //
    //         // on other player shot
    //         this.socket.on('player_shot', (playerShot) => {
    //             const socketId = playerShot.playerId
    //             if (this.engine.game.PLAYERS.has(socketId)) {
    //                 const player = this.engine.game.PLAYERS.get(socketId)
    //                 this.engine.soundManager.play(playerShot.sound)
    //                 this.engine.soundManager.onEnded()
    //
    //                 switch (playerShot.weapon) {
    //                     case 'M1911':
    //                     default:
    //                         player.sound.play()
    //                         player.sound.onEnded()
    //                         break;
    //                     case 'Knife':
    //                         player.knifeSound.play()
    //                         player.knifeSound.onEnded()
    //                         break;
    //
    //                 }
    //
    //             }
    //         })
    //
    //
    //
    //         /**
    //          * On door opened
    //          */
    //         this.socket.on('door_opened', (doorId) => {
    //             if (this.engine.game.three.DOORS.has(doorId)) {
    //                 console.log('[DOORS] door opened : ' + doorId)
    //                 this.engine.game.three.DOORS.get(doorId).isOpen = true
    //                 setTimeout(() => {
    //                     this.engine.game.three.DOORS.get(doorId).remove_()
    //                     this.engine.soundManager.play('door-buy')
    //                 }, 1000)
    //             }
    //         })
    //
    //     })
    // }

}