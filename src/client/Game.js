import * as THREE from "three";
import * as dat from 'dat.gui';
import GraphicsWorld from "./map/world/GraphicsWorld.js";
import GameMap from "./map/GameMap.js";
import InputManager from "./input/InputManager.js";
import ServerConnector from "./server/ServerConnector.js";
import Gui from "./gui/Gui.js";
import SoundManager from "./managers/SoundManager.js";
import WeaponHandler from "./weapon/WeaponHandler.js";

export default class Game {

    constructor() {

        // player
        this.player = {}
        this.player.maxHealth = 100
        this.player.health = this.player.maxHealth
        this.player.speed = 50
        this.player.mass = 90
        this.player.height = 1.8

        // three
        this.three = new GraphicsWorld(500, 500)

        this.startTime = Date.now();
        this.prevTime = performance.now();
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.lookDirection = new THREE.Vector3();
        this.gui = new Gui()

        this.config = {
            gravity: 2 // 9.8 normalement
        }



        this.PLAYERS = new Map()
        this.ZOMBIES = new Map()

        this.socket = undefined

        this.inputManager = new InputManager()

        this.soundManager = new SoundManager({camera: this.three.camera})
        this.weaponHandler = new WeaponHandler();

    }

    init() {

        this.three.init()
        // this.map.init()


        this.lastPosition = this.three.camera.position.clone()
        this.lastDirection = this.lookDirection.clone()

        window.addEventListener('ZombieGame-start', () => {
            this.serverConnector = new ServerConnector(window.location.href.substring(window.location.href.lastIndexOf('/') + 1))
        })

        this.animate()
    }

    animate() {
        requestAnimationFrame( () => {this.animate()} );
        const time = performance.now();
        const delta = ( time - this.prevTime ) / 1000;

        // loader gif
        if (this.startTime + 2000 < Date.now()) {
            this.canMove = true
            if (!window.ZombieGame.loader.classList.contains('d-none')) {
                window.ZombieGame.loader.classList.toggle('d-none')
            }
        }

        this.three.controls.getDirection(this.lookDirection)

        this.three.update()

        // GUN
        this.weaponHandler.update()

        // SOCKET SERVER
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

        // PLAYER MOVEMENT
        if (
            !this.inputManager.isChatOpen &&
            this.canMove
        ) {
            // stop forces
            this.velocity.x -= this.velocity.x * 10 * delta;
            this.velocity.z -= this.velocity.z * 10 * delta;
            this.velocity.y -= this.config.gravity * this.player.mass * delta;

            this.direction.z = Number( this.inputManager.moveForward ) - Number( this.inputManager.moveBackward );
            this.direction.x = Number( this.inputManager.moveRight ) - Number( this.inputManager.moveLeft );
            this.direction.normalize();

            if ( this.inputManager.moveForward || this.inputManager.moveBackward ) this.velocity.z -= this.direction.z * this.player.speed * delta;
            if ( this.inputManager.moveLeft || this.inputManager.moveRight ) this.velocity.x -= this.direction.x * this.player.speed * delta;

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