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
    }

    init() {
        this.engine = window.ZombieGame

        this.socket.on("connect", () => {
            console.log('[SOCKET] connected to room : ' + this.roomId)

            // window.GameEngine.infoDiv.innerText = this.socket.id

            // test event
            this.socket.on('pong', () => {
                console.log('pong from server')
            })

            // receive map info
            this.socket.on('map', (mapName) => {
                this.engine.modelManager.registerModel('map', '../gltf/maps/' + mapName)
            })

            // send username to socket
            const textConf = localStorage.getItem("GameEngine")
            if (textConf !== null) {
                const conf = JSON.parse(textConf)
                this.socket.emit('name', conf.username)
            }


            // On game start
            window.addEventListener('z3d-game-start', () => {

                this.socket.emit('ready')

                // // player points
                this.socket.on('points', (playerPoints) => {
                    console.log('[PLAYERS] points ', playerPoints)
                    this.engine.points.update(playerPoints)
                })

                // player name
                this.socket.on('player_name', (id, username) => {
                    if (this.engine.game.PLAYERS.has(id)) {
                        this.engine.game.PLAYERS.get(id).username = username
                    }
                })
                //
                // // chat message
                this.socket.on('chat', (msg, from) => {
                    console.log('[CHAT] message from ', from)
                    Utils.addMessageToChat(this.engine.chat, msg, from)
                })

                // get messages for the first time
                this.socket.on('get_chat_messages', (messages) => {
                    console.log('[CHAT] Messages already sent ', messages)
                    for (const i in messages) {
                        const msg = messages[i]
                        Utils.addMessageToChat(this.engine.chat, msg.message, msg.from)
                    }
                })

                // get players for the first time
                this.socket.on('get_players', (players) => {
                    console.log('[PLAYERS] Players allready connected ', players)
                    for (const i in players) {
                        if (players[i].socketId !== this.socket.id) {
                            this.engine.game.PLAYERS.set(players[i].socketId, new Player(players[i]))
                        }
                    }
                })

                // get zombies for the first time
                this.socket.on('get_zombies', (zombies) => {
                    console.log('[ZOMBIES] Zombies already spawned ', zombies)
                    for (const i in zombies) {
                        if (!this.engine.game.ZOMBIES.get(zombies[i].id)) {
                            this.engine.game.ZOMBIES.set(zombies[i].id, ZombieFactory.createClientZombie(zombies[i]))
                        }
                    }
                })

                // get a new player that just connected
                this.socket.on('player_connect', (player) => {
                    console.log('[CONNECT] Player ' + player.socketId + ' connected')
                    const p = new Player(player)
                    this.engine.game.PLAYERS.set(player.socketId, p)
                })
                // get a new player that just connected
                this.socket.on('player_disconnect', (socketId) => {
                    console.log('[DISCONNECT] Player ' + socketId + ' disconnected')
                    this.engine.game.PLAYERS.get(socketId).removeFromScene()
                    this.engine.game.PLAYERS.delete(socketId)
                })

                // get players position (update game state)
                this.socket.on('players_position', (playerList) => {
                    for (const i in playerList) {
                        if (playerList[i].socketId !== this.socket.id) {
                            if (this.engine.game.PLAYERS.has(playerList[i].socketId)) {
                                let p = this.engine.game.PLAYERS.get(playerList[i].socketId)
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
                        if (this.engine.game.ZOMBIES.has(z.id)) {
                            const zombie = this.engine.game.ZOMBIES.get(z.id)
                            zombie.mesh.position.set(z.position.x, z.position.y, z.position.z)
                            let angle = Math.atan2(z.direction.z, z.direction.x)
                            zombie.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI/2))
                            if (zombie.gltf !== undefined) {
                                zombie.gltf.position.set(z.position.x, z.position.y - 1, z.position.z)
                                zombie.gltf.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI/2))
                            }
                        }
                        else {
                            this.engine.game.ZOMBIES.set(z.id, ZombieFactory.createClientZombie(z))
                        }

                    }
                })

                // on other player shot
                this.socket.on('player_shot', (socketId) => {
                    if (this.engine.game.PLAYERS.has(socketId)) {
                        this.engine.game.PLAYERS.get(socketId).sound.play()
                        this.engine.game.PLAYERS.get(socketId).sound.onEnded()
                    }
                })

                // on zombie death
                this.socket.on('zombie_death', (zombieId) => {
                    if (this.engine.game.ZOMBIES.has(zombieId)) {
                        this.engine.game.ZOMBIES.get(zombieId).removeFromScene()
                        this.engine.game.ZOMBIES.delete(zombieId)
                    }
                })

            })

        });
    }

}