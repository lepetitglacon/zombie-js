import ThreeWorld from "./map/ThreeWorld.js";
import WeaponManager from "./weapon/WeaponManager.js";
import {Box3} from "three";
import ControllablePlayer from "./mob/ControllablePlayer.js";
import * as THREE from "three";


export default class Game {

    static STATUS = {
        PAUSED: 0,
        RUNNING: 1,
        TERMINATED: 2,
    }

    constructor(props) {

        this.PLAYERS = new Map()
        this.ZOMBIES = new Map()
        this.OBJECTS = new Map()

        this.player = new ControllablePlayer()
        this.points = 0
    }

    init() {
        this.engine = window.ZombieGame
        this.engine.serverConnector.init()

        this.engine.gui.addFolder("Velocity")
        this.engine.gui.addToFolder('Velocity', this.player.velocity, 'x', -50, 50)
        this.engine.gui.addToFolder('Velocity', this.player.velocity, 'y', -50, 50)
        this.engine.gui.addToFolder('Velocity', this.player.velocity, 'z', -50, 50)

        this.engine.gui.addFolder("GameEngine")
        this.engine.gui.addToFolder('GameEngine', this.engine, 'debug', true, false)

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

            this.three.init()

            this.player.init({
                three: this.three,
                engine: this.engine
            })

            this.engine.menu.init()
            this.engine.chat.init()
            this.engine.points.init()

            this.weaponHandler = new WeaponManager();

            this.cannonWorldConfig = {
                gravity: 9.8 // 9.8 normalementq
            }

            // /** player OBB **/
            // this.player.obb = new OBB(
            //     new Vector3(this.three.camera.position),
            //     new Vector3(this.player.width, this.player.height, this.player.depth),
            //     new Matrix3().setFromMatrix4(new Matrix4().makeRotationFromQuaternion(this.three.camera.quaternion))
            // )

            this.engine.loader.hide()

            console.log('[GAME] start')
            this.animate()
        })

    }

    animate() {
        requestAnimationFrame( () => {this.animate()} );
        const time = performance.now();
        const delta = ( time - this.prevTime ) / 1000;

        this.engine.gui.statsStart()
        if (this.engine.waveGui.wave === 0) {
            this.engine.serverConnector.socket.emit('wave')
        }

        this.three.controls.getDirection(this.player.lookDirection)

        this.player.update(delta)

        for (const [id, zombie] of this.ZOMBIES) {
            zombie.update()
        }

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


        this.three.renderer.render( this.three.scene, this.three.camera );

        this.prevTime = time;
        this.engine.gui.statsEnd()
    }

}