import * as THREE from "three";
import Player from "../mob/Player.js";
import ZombieFactory from "../../common/factory/ZombieFactory.js";

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

            this.socket.on('pong', () => {
                console.log('pong from server')
            })

            // chat message
            this.socket.on('chat', (msg, from) => {
                console.log('[CHAT] message from ', from)
                const msgLi = document.createElement('li')
                msgLi.innerText = from + ' : ' + msg
                window.ZombieGame.chatUl.appendChild(msgLi)
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
                    if (window.ZombieGame.game.ZOMBIES.get(zombies[i].id)) {
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
                    } else {
                        window.ZombieGame.game.ZOMBIES.set(z.id, ZombieFactory.createClientZombie(z))
                    }

                }
            })
        });
    }



}