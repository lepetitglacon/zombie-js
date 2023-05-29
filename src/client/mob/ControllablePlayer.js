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

        if (this.engine.state !== GameEngine.STATE.CHAT) {
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

            console.log(this.three.controls.direction)

            // collisions
            for (let i = 0; i < this.three.BUILDINGS.length; i++) {
                const wallBox = this.three.BUILDINGS[i]

                // console.log(this.sweptAABB(this.aabb, wallBox, this.velocity))
            }

            this.three.controls.move(this.velocity.clone().multiplyScalar(delta));
            this.three.controls.getObject().position.y += ( this.velocity.y * delta );
        }



        // not falling through ground
        if ( this.three.controls.getObject().position.y < 1.8 ) {
            this.engine.inputManager.canJump = true
            this.velocity.y = 0;
            this.three.controls.getObject().position.y = 1.8;
        }

        // update mesh
        this.mesh.position.copy(this.three.camera.position)
        this.mesh.rotation.copy(this.three.camera.rotation)

        // update AABB
        this.aabb.setFromObject(this.mesh)

    }

    sweptAABB(box1, box2, velocity) {
        // Calculate the delta between the two bounding boxes
        const delta = box2.min.clone().sub(box1.max);

        // Calculate the time of impact in each axis
        const tMin = new THREE.Vector3();
        const tMax = new THREE.Vector3();

        // Calculate the inverse velocity components
        const invVelocity = new THREE.Vector3(1 / velocity.x, 1 / velocity.y, 1 / velocity.z);

        // Calculate the time of impact on each axis
        tMin.x = delta.x * invVelocity.x;
        tMax.x = delta.x * invVelocity.x;
        tMin.y = delta.y * invVelocity.y;
        tMax.y = delta.y * invVelocity.y;
        tMin.z = delta.z * invVelocity.z;
        tMax.z = delta.z * invVelocity.z;

        // Find the maximum of the minimum time of impact values
        const tEnter = Math.max(Math.max(tMin.x, tMin.y), tMin.z);

        // Find the minimum of the maximum time of impact values
        const tExit = Math.min(Math.min(tMax.x, tMax.y), tMax.z);

        // Check if there is a collision
        if (tEnter > tExit || tEnter > 1 || tExit < 0) {
            return null; // No collision
        } else {
            const collisionTime = Math.max(0, tEnter);
            const collisionPoint = box1.max.clone().addScaledVector(velocity, collisionTime);
            return collisionPoint;
        }
    }
}