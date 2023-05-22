import * as THREE from "three";
import ThreeWorld from "./map/world/GraphicsWorld.js";
import WeaponHandler from "./weapon/WeaponHandler.js";
import {OBB} from "three/addons/math/OBB.js";
import {Matrix3, Matrix4, Ray, Vector3} from "three";
import {negate} from "three/nodes";


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

            this.player.obb = new OBB(
                new Vector3(this.three.camera.position),
                new Vector3(this.player.width, this.player.height, this.player.depth),
                new Matrix3().setFromMatrix4(new Matrix4().makeRotationFromQuaternion(this.three.camera.quaternion))
            )

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

            // direction
            this.player.direction.z = Number( this.engine.inputManager.moveForward ) - Number( this.engine.inputManager.moveBackward );
            this.player.direction.x = Number( this.engine.inputManager.moveRight ) - Number( this.engine.inputManager.moveLeft );
            this.player.direction.normalize();

            // set velocities
            if ( this.engine.inputManager.moveForward || this.engine.inputManager.moveBackward ) {
                this.player.velocity.z -= this.player.direction.z * this.player.speed * delta;
            }
            if ( this.engine.inputManager.moveLeft || this.engine.inputManager.moveRight ) {
                this.player.velocity.x -= this.player.direction.x * this.player.speed * delta;
            }

            for (const i in this.three.OBBs) {
                const obb = this.three.OBBs[i]
                const nextX = obb
                    .containsPoint(this.three.controls
                        .testMoveRight(- this.player.velocity.x * (delta * 2))
                    )
                const nextZ = obb
                    .containsPoint(this.three.controls
                        .testMoveForward(- this.player.velocity.z * (delta * 2))
                    )

                if (nextX && nextZ) {
                    console.debug('both points in obb: adjust player direction');
                    const wallNormal = this.getWallNormal(obb.center, obb.halfSize, this.three.controls.testMoveForward(- this.player.velocity.z * (delta * 2)));
                    const playerVelocity = this.player.velocity.clone();
                    const playerDirection = playerVelocity.normalize();
                    const dotProduct = playerDirection.dot(wallNormal);
                    const wallParallel = wallNormal.clone().multiplyScalar(dotProduct);
                    const wallPerpendicular = wallNormal.clone().sub(wallParallel);
                    const newPlayerVelocity = wallParallel.clone().add(wallPerpendicular);
                    this.player.velocity.copy(newPlayerVelocity);
                    this.player.direction.copy(newPlayerVelocity.normalize());
                } else {
                    if (nextZ) {
                        console.debug('can"t go further : can go right/left')
                        this.player.velocity.z = 0
                    } else if (nextX) {
                        console.debug('can"t go right/left : can go front/back')
                        this.player.velocity.x = 0
                    } else {

                    }
                }
            }

            this.three.controls.moveRight( - this.player.velocity.x * delta );
            this.three.controls.moveForward( - this.player.velocity.z * delta );
            this.three.controls.getObject().position.y += ( this.player.velocity.y * delta );

            this.player.obb.center.copy(this.three.camera.position)
            this.player.obb.rotation.setFromMatrix4(new Matrix4().makeRotationFromQuaternion(this.three.camera.quaternion))

        }

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

    getWallNormal(wallCenter, wallSize, point) {
        const halfSize = wallSize.clone();

        // Calculate the difference vector between the wall center and the collision point
        const difference = point.clone().sub(wallCenter);

        // Calculate the absolute difference vector
        const absDifference = new Vector3(
            Math.abs(difference.x),
            Math.abs(difference.y),
            Math.abs(difference.z)
        );

        // Determine the face with the maximum absolute difference
        const maxComponent = absDifference.maxComponent();

        // Calculate the normal based on the face with the maximum absolute difference
        const normal = new Vector3();

        switch (maxComponent) {
            case 0: // X-axis face
                normal.set(difference.x > 0 ? 1 : -1, 0, 0);
                break;
            case 1: // Y-axis face
                normal.set(0, difference.y > 0 ? 1 : -1, 0);
                break;
            case 2: // Z-axis face
                normal.set(0, 0, difference.z > 0 ? 1 : -1);
                break;
        }

        return normal;
    }

}