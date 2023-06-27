import * as THREE from "three";
import {Box3, Box3Helper, Vector3} from "three";
import GameEngine from "../GameEngine.js";

export default class ControllablePlayer {


    constructor() {

        // game attributes
        this.maxHealth = 100
        this.health = this.maxHealth

        // movement
        this.speed = 50
        this.speedBoost = 1.05
        this.mass = 90
        this.velocity = new THREE.Vector3();
        this.feetDirection = new THREE.Vector3();
        this.lookDirection = new THREE.Vector3();
        this.lastDirection = this.lookDirection.clone()

        // shape
        this.height = 1.8
        this.width = .5
        this.depth = .5

        // model
    }

    init(props) {
        this.engine = props.engine
        this.three = props.three

        this.position = this.three.camera.position
        this.lastPosition = this.three.camera.position.clone()

        // player mesh
        this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth)
        this.material = new THREE.MeshStandardMaterial({
            color: 0xee2222,
            wireframe: true,
            opacity: 0,
            transparent: true
        })
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.copy(this.position)
        this.mesh.geometry.computeBoundingBox()
        this.three.scene.add(this.mesh)

        this.aabb = new Box3()
        this.aabb.setFromObject(this.mesh)

        this.aabbHelper = new Box3Helper(this.aabb)
        this.three.scene.add(this.aabbHelper)



    }

    update(delta) {

        // stop forces
        this.velocity.x -= this.velocity.x * 10 * delta;
        this.velocity.z -= this.velocity.z * 10 * delta;
        this.velocity.y -= 10 * (this.mass) * delta;

        if (
            this.engine.state !== GameEngine.STATE.CHAT ||
            this.engine.state !== GameEngine.STATE.MENU
        ) {

            // normalized direction of the keys pressed
            this.feetDirection.z = Number( this.engine.inputManager.moveForward ) - Number( this.engine.inputManager.moveBackward );
            this.feetDirection.x = Number( this.engine.inputManager.moveRight ) - Number( this.engine.inputManager.moveLeft );
            this.feetDirection.normalize();

            // set velocities in absolute direction
            if ( this.engine.inputManager.moveForward || this.engine.inputManager.moveBackward ) {
                this.velocity.z += this.feetDirection.z * this.speed * delta;
            }
            if ( this.engine.inputManager.moveLeft || this.engine.inputManager.moveRight ) {
                this.velocity.x += this.feetDirection.x * this.speed * delta;
            }

            if (this.engine.inputManager.isRunning) {
                if (this.velocity.z > 0) {
                    this.velocity.z *= this.speedBoost
                }
            }
        }

        // Doors hitbox
        let hitDoor = false
        for (const [name, door] of this.three.DOORS) {
            if (this.aabb.intersectsBox(door.actionAABB)) {
                const doorMessage = `Press F to Unlock Door : ${door.price}`
                this.engine.actionGui.setMessage(doorMessage)
                this.engine.actionGui.setDoor(door)
                hitDoor = true
            }
        }
        if (hitDoor === false) {
            this.engine.actionGui.hide()
        }

        // update positions
        this.three.controls.move(this.velocity.clone().multiplyScalar(delta));
        this.three.controls.getObject().position.y += ( this.velocity.y * delta );

        // arrow helpers
        let lookDirectionVec = this.three.controls._direction.clone()
        if (this.lookDirectionVec) this.three.scene.remove(this.lookDirectionVec);
        this.lookDirectionVec = new THREE.ArrowHelper( lookDirectionVec, this.three.camera.position, 2, 0xffff00 );
        this.three.scene.add( this.lookDirectionVec );

        let feetDirectionVec = this.three.controls._worldDirection.clone()
        feetDirectionVec.y = 0
        if (this.feetDirectionVec) this.three.scene.remove(this.feetDirectionVec);
        this.feetDirectionVec = new THREE.ArrowHelper( feetDirectionVec, this.three.camera.position, 2, 0x00ff00 );
        this.three.scene.add( this.feetDirectionVec );

        // not falling through ground
        if ( this.three.controls.getObject().position.y < 1.8 ) {
            this.engine.inputManager.canJump = true
            this.velocity.y = 0;
            this.three.controls.getObject().position.y = 1.8;
        }

        // update mesh
        this.mesh.position.copy(this.three.camera.position)

        // update AABB
        this.aabb.setFromObject(this.mesh)

    }
}