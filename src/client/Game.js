import * as THREE from "three";
import ThreeWorld from "./map/world/GraphicsWorld.js";
import WeaponHandler from "./weapon/WeaponHandler.js";


export default class Game {

    constructor(props) {

        this.PLAYERS = new Map()
        this.ZOMBIES = new Map()

        // player
        this.player = {}
        this.player.maxHealth = 100
        this.player.health = this.player.maxHealth
        this.player.speed = 50
        this.player.mass = 90
        this.player.height = 1.8
        this.player.velocity = new THREE.Vector3();
        this.player.direction = new THREE.Vector3();
        this.player.lookDirection = new THREE.Vector3();
        this.player.lastDirection = this.player.lookDirection.clone()
    }

    init() {
        this.engine = window.ZombieGame
        this.engine.serverConnector.init()

        this.engine.modelManager.download().then(r => {
            console.log('[GAME] init')

            window.dispatchEvent(new Event('z3d-game-start'))

            this.startTime = Date.now();
            this.prevTime = performance.now();

            // three
            this.three = new ThreeWorld()

            // three dependencies
            this.engine.soundManager.init()
            this.engine.inputManager.init()

            this.engine.menu.init()
            this.engine.chat.init()
            this.engine.points.init()

            this.player.lastPosition = this.three.camera.position.clone()
            this.weaponHandler = new WeaponHandler();

            this.cannonWorldConfig = {
                gravity: 9.8 // 9.8 normalement
            }

            this.three.init()



            this.engine.loader.hide()

            console.log('[GAME] start')
            this.animate()
        })

    }

    animate() {
        requestAnimationFrame( () => {this.animate()} );

        this.engine.gui.statsStart()

        const time = performance.now();
        const delta = ( time - this.prevTime ) / 1000;

        this.three.controls.getDirection(this.player.lookDirection)

        // GUN
        this.weaponHandler.update()

        // Send player position to server
        if (
            !this.player.lastPosition.equals(this.three.camera.position) ||
            !this.player.lastDirection.equals(this.player.lookDirection)
        ) {
            let pos = this.three.camera.position.clone()
            pos.y -= .5
            this.engine.serverConnector.socket.volatile.emit('player_state', pos, this.player.lookDirection)
            this.player.lastPosition = this.three.camera.position.clone()
            this.player.lastDirection = this.player.lookDirection.clone()
        }

        // PLAYER MOVEMENT
        if (
            !this.engine.chat.isOpen
        ) {
            // stop forces
            this.player.velocity.x -= this.player.velocity.x * 10 * delta;
            this.player.velocity.z -= this.player.velocity.z * 10 * delta;
            this.player.velocity.y -= this.cannonWorldConfig.gravity * (this.player.mass / 8) * delta;

            this.player.direction.z = Number( this.engine.inputManager.moveForward ) - Number( this.engine.inputManager.moveBackward );
            this.player.direction.x = Number( this.engine.inputManager.moveRight ) - Number( this.engine.inputManager.moveLeft );
            this.player.direction.normalize();

            if ( this.engine.inputManager.moveForward || this.engine.inputManager.moveBackward ) {
                this.player.velocity.z -= this.player.direction.z * this.player.speed * delta;
            }
            if ( this.engine.inputManager.moveLeft || this.engine.inputManager.moveRight ) {
                this.player.velocity.x -= this.player.direction.x * this.player.speed * delta;
            }

            this.three.controls.moveRight( - this.player.velocity.x * delta );
            this.three.controls.moveForward( - this.player.velocity.z * delta );
            this.three.controls.getObject().position.y += ( this.player.velocity.y * delta );
        }

        if ( this.three.controls.getObject().position.y < .5 ) {
            this.engine.inputManager.canJump = true
            this.player.velocity.y = 0;
            this.three.controls.getObject().position.y = .5;
        }


        this.prevTime = time;
        this.three.renderer.render( this.three.scene, this.three.camera );

        this.engine.gui.statsEnd()
    }

}