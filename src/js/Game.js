import * as CANNON from "cannon-es";
import * as THREE from "three";
import GraphicsWorld from "./map/world/GraphicsWorld.js";
import PhysicsWorld from "./map/world/PhysicsWorld.js";
import GameMap from "./map/GameMap.js";
import InputManager from "./input/InputManager.js";
import Player from "./common/Player.js";

export default class Game {

    constructor() {
        this.prevTime = performance.now();
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.lookDirection = new THREE.Vector3();

        this.PLAYERS = new Map()
        this.socket = undefined

        this.infoDiv = document.createElement("div")
        this.infoDiv.id = 'info'
        document.body.appendChild(this.infoDiv)
    }

    init() {
        this.inputManager = new InputManager()

        this.three = new GraphicsWorld(500, 500)
        this.cannon = new PhysicsWorld()
        this.map = new GameMap()

        this.lastPosition = this.three.camera.position.clone()
        this.lastDirection = this.lookDirection.clone()

        window.addEventListener('ZombieGame-start', () => {

            this.socket = io()
            this.socket.on("connect", () => {
                console.log('[SOCKET] connected to server')

                this.infoDiv.innerText = this.socket.id

                this.socket.on('pong', () => {
                    console.log('pong from server')
                })

                this.socket.on('get_players', (players) => {
                    console.log('[SOCKET] Players allready connected ', players)
                    for (const i in players) {
                        if (players[i].socketId !== this.socket.id) {
                            const p = new Player(players[i].socketId)
                            this.PLAYERS.set(players[i].socketId, p)
                        }
                    }
                })
                this.socket.on('player_connect', (socketId) => {
                    console.log('[CONNECT] Player ' + socketId + ' connected')
                    const p = new Player(socketId)
                    this.PLAYERS.set(socketId, p)
                })
                this.socket.on('player_disconnect', (socketId) => {
                    console.log('[DISCONNECT] Player ' + socketId + ' disconnected')
                    console.log(this.PLAYERS.get(socketId))
                    window.ZombieGame.game.three.scene.remove(this.PLAYERS.get(socketId).mesh)
                    this.PLAYERS.delete(socketId)
                })
                this.socket.on('players_position', (playerList) => {
                    for (const i in playerList) {
                        if (playerList[i].socketId !== this.socketid) {
                            if (this.PLAYERS.has(playerList[i].socketId)) {
                                let p = this.PLAYERS.get(playerList[i].socketId)
                                p.mesh.position.set(playerList[i].position.x, playerList[i].position.y, playerList[i].position.z)
                                // p.mesh.lookAt(playerList[i].direction)

                                p.mesh.rotateY(Math.atan2(playerList[i].direction.y, playerList[i].direction.x))
                            }
                        }

                    }
                })
            });


        })
        
        this.animate()
    }

    animate() {
        requestAnimationFrame( () => {this.animate()} );

        this.three.controls.getDirection(this.lookDirection)


        const time = performance.now();
        const delta = ( time - this.prevTime ) / 1000;

        this.three.update()

        for (const [socketId, player] of this.PLAYERS) {
            // player.mesh.position.copy(player.body.position)
            // player.mesh.position.copy(player.body.position)
        }

        if (this.socket !== undefined) {
            if (!this.lastPosition.equals(this.three.camera.position)) {
                this.socket.volatile.emit('position', this.three.camera.position)
                this.lastPosition = this.three.camera.position.clone()
            }
            if (!this.lastDirection.equals(this.lookDirection)) {
                this.socket.volatile.emit('direction', this.lookDirection)
                this.lastDirection = this.lookDirection.clone()
                console.log(this.lookDirection)
            }
        }

        if (this.three.controls.isLocked === true) {

            // stop forces
            this.velocity.x -= this.velocity.x * 10 * delta;
            this.velocity.z -= this.velocity.z * 10 * delta;
            this.velocity.y -= 9.8 * window.ZombieGame.player.mass * delta; // 100.0 = mass

            this.direction.z = Number( this.inputManager.moveForward ) - Number( this.inputManager.moveBackward );
            this.direction.x = Number( this.inputManager.moveRight ) - Number( this.inputManager.moveLeft );
            this.direction.normalize();

            if ( this.inputManager.moveForward || this.inputManager.moveBackward ) this.velocity.z -= this.direction.z * window.ZombieGame.player.speed * delta;
            if ( this.inputManager.moveLeft || this.inputManager.moveRight ) this.velocity.x -= this.direction.x * window.ZombieGame.player.speed * delta;

            this.three.controls.moveRight( - this.velocity.x * delta );
            this.three.controls.moveForward( - this.velocity.z * delta );
            this.three.controls.getObject().position.y += ( this.velocity.y * delta ); // new behavior

            if ( this.three.controls.getObject().position.y < 0 ) {
                this.velocity.y = 0;
                this.three.controls.getObject().position.y = 0;
            }
        }

        this.cannon.world.step(delta)
        this.cannon.debugger.update()
        this.prevTime = time;
        this.three.renderer.render( this.three.scene, this.three.camera );
    }

}