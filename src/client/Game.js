import * as THREE from "three";
import * as CANNON from "cannon-es";
import ThreeWorld from "./map/world/GraphicsWorld.js";
import WeaponHandler from "./weapon/WeaponHandler.js";
import {OBB} from "three/addons/math/OBB.js";
import {Matrix3, Matrix4, Ray, Vector3} from "three";
import {negate} from "three/nodes";
import ZombieFactory from "../common/factory/ZombieFactory.js";


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
        this.player.width = .5
        this.player.depth = .5
        this.player.velocity = new THREE.Vector3();
        this.player.direction = new THREE.Vector3();
        this.player.lookDirection = new THREE.Vector3();
        this.player.lastDirection = this.player.lookDirection.clone()

        const raycastMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

        this.wallCollisionRayCaster = new THREE.Raycaster();
        this.wallCollisionPointer = new THREE.Vector2();
        this.wallCollisionRayCasterGeometry = new THREE.BufferGeometry().setFromPoints( this.wallCollisionPointer );
        this.wallCollisionRayCasterLine = new THREE.Line( this.wallCollisionRayCasterGeometry, raycastMaterial );


    }

    init() {
        this.engine = window.ZombieGame
        this.engine.serverConnector.init()

        this.engine.gui.addFolder("Velocity")
        this.engine.gui.addToFolder('Velocity', this.player.velocity, 'x', -50, 50)
        this.engine.gui.addToFolder('Velocity', this.player.velocity, 'y', -50, 50)
        this.engine.gui.addToFolder('Velocity', this.player.velocity, 'z', -50, 50)

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

            this.ZOMBIES.set(0, ZombieFactory.createClientZombie({
                color: 0x000000,
                id: 0,
                position: new Vector3(0,0,0)
            }))

            this.ZOMBIES.get(0).removeFromScene()

            // this.player.body = new CANNON.Body({
            //     mass: 5,
            //     shape: new CANNON.Sphere(1.3),
            // })
            // this.player.body.position.y = 1
            // this.player.body.linearDamping = 0.9;
            // this.three.world.addBody(this.player.body)

            /** player OBB **/
            this.player.obb = new OBB(
                new Vector3(this.three.camera.position),
                new Vector3(this.player.width, this.player.height, this.player.depth),
                new Matrix3().setFromMatrix4(new Matrix4().makeRotationFromQuaternion(this.three.camera.quaternion))
            )

            this.three.scene.add(this.wallCollisionRayCasterLine)

            this.engine.loader.hide()

            console.log('[GAME] start')
            this.animate()
        })

    }

    animate() {
        requestAnimationFrame( () => {this.animate()} );

        this.engine.gui.statsStart()
        if (this.engine.waveGui.wave === 0) {
            this.engine.serverConnector.socket.emit('wave')
        }

        const time = performance.now();
        const delta = ( time - this.prevTime ) / 1000;

        for (const [id, zombie] of this.ZOMBIES) {
            zombie.animationManager.update(delta)
        }

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
            // normalized direction of the keys pressed
            this.player.direction.z = Number( this.engine.inputManager.moveForward ) - Number( this.engine.inputManager.moveBackward );
            this.player.direction.x = Number( this.engine.inputManager.moveRight ) - Number( this.engine.inputManager.moveLeft );
            this.player.direction.normalize();

            // set velocities in wrong direction
            if ( this.engine.inputManager.moveForward || this.engine.inputManager.moveBackward ) {
                this.player.velocity.z += this.player.direction.z * this.player.speed * delta;
            }
            if ( this.engine.inputManager.moveLeft || this.engine.inputManager.moveRight ) {
                this.player.velocity.x += this.player.direction.x * this.player.speed * delta;
            }

            // COLLISIONS
            // for (const i in this.three.OBBs) {
            //     const obb = this.three.OBBs[i]
            //
            //     const nextX = obb
            //         .containsPoint(this.three.controls
            //             .testMoveRight(this.player.velocity.x * (delta), 2)
            //         ) || obb.intersectsOBB(this.player.obb)
            //     const nextZ = obb
            //         .containsPoint(this.three.controls
            //             .testMoveForward(this.player.velocity.z * (delta), 2)
            //         ) || obb.intersectsOBB(this.player.obb)
            //
            //     if (nextX && nextZ) {
            //
            //         const raycaster = new THREE.Raycaster();
            //         raycaster.setFromCamera( obb.object.position, this.three.camera );
            //         const intersects = raycaster.intersectObject( obb.object );
            //
            //         for ( let i = 0; i < intersects.length; i ++ ) {
            //             const intersect = intersects[i]
            //             if (intersect.distance < 1) {
            //
            //
            //
            //             }
            //         }
            //
            //     } else {
            //         if (nextZ) {
            //             console.debug('can"t go further : can go right/left')
            //             this.player.velocity.z = 0
            //         } else if (nextX) {
            //             console.debug('can"t go right/left : can go front/back')
            //             this.player.velocity.x = 0
            //         } else {
            //
            //         }
            //     }
            // }

            this.three.controls.moveRight( this.player.velocity.x * delta );
            this.three.controls.moveForward( this.player.velocity.z * delta );
            this.three.controls.getObject().position.y += ( this.player.velocity.y * delta );

            this.player.obb.center.copy(this.three.camera.position)
            this.player.obb.rotation.setFromMatrix4(new Matrix4().makeRotationFromQuaternion(this.three.camera.quaternion))
        }

        // stop forces
        this.player.velocity.x -= this.player.velocity.x * 10 * delta;
        this.player.velocity.z -= this.player.velocity.z * 10 * delta;
        this.player.velocity.y -= this.cannonWorldConfig.gravity * (this.player.mass) * delta;

        if ( this.three.controls.getObject().position.y < 1.8 ) {
            this.engine.inputManager.canJump = true
            this.player.velocity.y = 0;
            this.three.controls.getObject().position.y = 1.8;
        }

        this.three.cannonDebugRenderer.update()
        this.three.world.step(delta)
        this.three.renderer.render( this.three.scene, this.three.camera );

        this.prevTime = time;
        this.engine.gui.statsEnd()
    }

}