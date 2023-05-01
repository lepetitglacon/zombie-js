import * as THREE from "three";
import Player from "../mob/Player.js";
import ZombieFactory from "../../common/factory/ZombieFactory.js";
import {attribute} from "three/nodes";
import Utils from "../../common/Utils.js";

export default class ServerConnector {

    constructor(roomId) {
        this.roomId = roomId
        this.socket = io({
            query: {
                roomName: this.roomId,
            },
        });
        this.bind()
    }

    bind() {
        this.socket.on("connect", () => {
            console.log('[SOCKET] connected to room : ' + this.roomId)

            window.ZombieGame.infoDiv.innerText = this.socket.id

            const textConf = localStorage.getItem("ZombieGame")
            if (textConf !== null) {
                const conf = JSON.parse(textConf)
                this.socket.emit('name', conf.username)
            }

            this.socket.on('pong', () => {
                console.log('pong from server')
            })

            // receive map info
            this.socket.on('map', (mapName) => {
                window.ZombieGame.game.three.loadMap(mapName)
            })

            // player points
            this.socket.on('points', (playerPoints) => {
                console.log('[PLAYERS] points ', playerPoints)
                for (const i in playerPoints) {
                    const points = playerPoints[i]
                    this.updatePoints(points.player, points.points)
                }
            })

            // player name
            this.socket.on('player_name', (id, username) => {
                if (window.ZombieGame.game.PLAYERS.has(id)) {
                    window.ZombieGame.game.PLAYERS.get(id).username = username
                }
            })

            // chat message
            this.socket.on('chat', (msg, from) => {
                console.log('[CHAT] message from ', from)
                Utils.addMessageToChat(msg, from)
            })

            // get messages for the first time
            this.socket.on('get_chat_messages', (messages) => {
                console.log('[CHAT] Messages already sent ', messages)
                for (const i in messages) {
                    const msg = messages[i]
                    Utils.addMessageToChat(msg.message, msg.from)
                }
            })

            // get players for the first time
            this.socket.on('get_players', (players) => {
                console.log('[PLAYERS] Players allready connected ', players)
                for (const i in players) {
                    if (players[i].socketId !== this.socket.id) {
                        window.ZombieGame.game.PLAYERS.set(players[i].socketId, new Player(players[i]))
                    }
                }
            })

            // get zombies for the first time
            this.socket.on('get_zombies', (zombies) => {
                console.log('[ZOMBIES] Zombies already spawned ', zombies)
                for (const i in zombies) {
                    if (!window.ZombieGame.game.ZOMBIES.get(zombies[i].id)) {
                        window.ZombieGame.game.ZOMBIES.set(zombies[i].id, ZombieFactory.createClientZombie(zombies[i]))
                    }
                }
            })

            // get a new player that just connected
            this.socket.on('player_connect', (player) => {
                console.log('[CONNECT] Player ' + player.socketId + ' connected')
                const p = new Player(player)
                window.ZombieGame.game.PLAYERS.set(player.socketId, p)
            })
            // get a new player that just connected
            this.socket.on('player_disconnect', (socketId) => {
                console.log('[DISCONNECT] Player ' + socketId + ' disconnected')
                window.ZombieGame.game.PLAYERS.get(socketId).removeFromScene()
                window.ZombieGame.game.PLAYERS.delete(socketId)
            })

            // get players position (update game state)
            this.socket.on('players_position', (playerList) => {
                for (const i in playerList) {
                    if (playerList[i].socketId !== this.socket.id) {
                        if (window.ZombieGame.game.PLAYERS.has(playerList[i].socketId)) {
                            let p = window.ZombieGame.game.PLAYERS.get(playerList[i].socketId)
                            p.mesh.position.set(playerList[i].position.x, playerList[i].position.y, playerList[i].position.z)

                            let angle = Math.atan2(playerList[i].direction.z,playerList[i].direction.x)
                            p.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI/2))

                            if (p.gltf !== undefined) {
                                p.gltf.position.set(playerList[i].position.x, playerList[i].position.y - 1, playerList[i].position.z)
                                p.gltf.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI/2))
                                p.sound.getOutput().positionX.setValueAtTime(
                                    playerList[i].position.x ,
                                    0
                                )
                                p.sound.getOutput().positionZ.setValueAtTime(
                                    playerList[i].position.z ,
                                    0
                                )
                            }
                        }
                    }
                }
            })

            // get players position (update game state)
            this.socket.on('zombies_positions', (zombieList) => {
                for (const i in zombieList) {
                    const z = zombieList[i]
                    if (window.ZombieGame.game.ZOMBIES.has(z.id)) {
                        const zombie = window.ZombieGame.game.ZOMBIES.get(z.id)
                        zombie.mesh.position.set(z.position.x, z.position.y, z.position.z)
                        let angle = Math.atan2(z.direction.z, z.direction.x)
                        zombie.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI/2))
                        if (zombie.gltf !== undefined) {
                            zombie.gltf.position.set(z.position.x, z.position.y - 1, z.position.z)
                            zombie.gltf.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI/2))
                        }
                    }
                    else {
                        window.ZombieGame.game.ZOMBIES.set(z.id, ZombieFactory.createClientZombie(z))
                    }

                }
            })

            // on other player shot
            this.socket.on('player_shot', (socketId) => {
                if (window.ZombieGame.game.PLAYERS.has(socketId)) {
                    window.ZombieGame.game.PLAYERS.get(socketId).sound.play()
                    window.ZombieGame.game.PLAYERS.get(socketId).sound.onEnded()
                }
            })

            // on zombie death
            this.socket.on('zombie_death', (zombieId) => {
                if (window.ZombieGame.game.ZOMBIES.has(zombieId)) {
                    window.ZombieGame.game.ZOMBIES.get(zombieId).removeFromScene()
                    window.ZombieGame.game.ZOMBIES.delete(zombieId)
                }
            })


        });
    }

    updatePoints(player, points) {

        let username = ""
        if (window.ZombieGame.game.PLAYERS.has(player)) {
            username = window.ZombieGame.game.PLAYERS.get(player).username
        }
        username += ` (${player})`
        const text = username + ' : ' + points

        const pointsDiv = document.getElementById('points_' + player)
        if (pointsDiv !== null) {
            pointsDiv.innerText = text
        } else {
            const msgDiv = document.createElement('div')
            msgDiv.id = 'points_' + player
            msgDiv.innerText = text
            window.ZombieGame.points.appendChild(msgDiv)
        }
    }

}