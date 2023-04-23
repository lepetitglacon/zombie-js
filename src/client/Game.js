import * as THREE from "three";
import GraphicsWorld from "./map/world/GraphicsWorld.js";
import GameMap from "./map/GameMap.js";
import InputManager from "./input/InputManager.js";
import ServerConnector from "./server/ServerConnector.js";

export default class Game {

    constructor() {
        this.prevTime = performance.now();
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.lookDirection = new THREE.Vector3();

        this.config = {
            gravity: 2 // 9.8 normalement
        }

        this.PLAYERS = new Map()
        this.socket = undefined

        this.inputManager = new InputManager()
        this.three = new GraphicsWorld(500, 500)
        this.map = new GameMap()
    }

    init() {

        this.map.init()

        this.lastPosition = this.three.camera.position.clone()
        this.lastDirection = this.lookDirection.clone()

        window.addEventListener('ZombieGame-start', () => {
            this.serverConnector = new ServerConnector(window.location.href.substring(window.location.href.lastIndexOf('/') + 1))
        })
        
        this.animate()
    }

    animate() {
        requestAnimationFrame( () => {this.animate()} );

        this.three.controls.getDirection(this.lookDirection)
        this.three.raycaster.setFromCamera( this.three.pointer, this.three.camera );

        const time = performance.now();
        const delta = ( time - this.prevTime ) / 1000;

        this.three.update()

        if (this.serverConnector !== undefined) {
            if (
                !this.lastPosition.equals(this.three.camera.position) ||
                !this.lastDirection.equals(this.lookDirection)
            ) {
                let pos = this.three.camera.position.clone()
                pos.y -= .5
                this.serverConnector.socket.volatile.emit('player_state', pos, this.lookDirection)
                this.lastPosition = this.three.camera.position.clone()
                this.lastDirection = this.lookDirection.clone()
            }
        }

        if (!this.inputManager.isChatOpen) {
            // stop forces
            this.velocity.x -= this.velocity.x * 10 * delta;
            this.velocity.z -= this.velocity.z * 10 * delta;
            this.velocity.y -= this.config.gravity * window.ZombieGame.player.mass * delta;

            this.direction.z = Number( this.inputManager.moveForward ) - Number( this.inputManager.moveBackward );
            this.direction.x = Number( this.inputManager.moveRight ) - Number( this.inputManager.moveLeft );
            this.direction.normalize();

            if ( this.inputManager.moveForward || this.inputManager.moveBackward ) this.velocity.z -= this.direction.z * window.ZombieGame.player.speed * delta;
            if ( this.inputManager.moveLeft || this.inputManager.moveRight ) this.velocity.x -= this.direction.x * window.ZombieGame.player.speed * delta;

            this.three.controls.moveRight( - this.velocity.x * delta );
            this.three.controls.moveForward( - this.velocity.z * delta );
            this.three.controls.getObject().position.y += ( this.velocity.y * delta );
        }

        if ( this.three.controls.getObject().position.y < .5 ) {
            this.inputManager.canJump = true
            this.velocity.y = 0;
            this.three.controls.getObject().position.y = .5;
        }

        this.prevTime = time;
        this.three.renderer.render( this.three.scene, this.three.camera );
    }

}