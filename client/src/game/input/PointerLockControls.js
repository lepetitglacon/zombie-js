import {ArrowHelper, Box3, Euler, EventDispatcher, Vector3} from 'three';

const _changeEvent = {type: 'change'};
const _lockEvent = {type: 'lock'};
const _unlockEvent = {type: 'unlock'};

const _PI_2 = Math.PI / 2;

export default class PointerLockControls extends EventDispatcher {

    constructor({camera, domElement, engine, player}) {
        super();

        this._euler = new Euler(0, 0, 0, 'YXZ');
        this._direction = new Vector3();
        this._lastPosition = new Vector3();
        this._worldDirection = new Vector3()

        this.zeroVector = new Vector3()

        this.camera = camera;
        this.domElement = domElement;
        this.engine = engine;
        this.player = player;

        this.isLocked = false;

        // Set to constrain the pitch of the camera
        // Range is 0 to Math.PI radians
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        this.pointerSpeed = 1.0;

        this._onMouseMove = onMouseMove.bind(this);
        this._onPointerlockChange = onPointerlockChange.bind(this);
        this._onPointerlockError = onPointerlockError.bind(this);

        this.connect();

    }

    update(delta) {
        this.updatePlayerVelocity(delta)
        this.movePlayerCamera(this.player.velocity.clone().multiplyScalar(delta))
        this.getDirection(this.engine.controllablePlayer.lookDirection)
    }

    updatePlayerVelocity(delta) {
        // stopping forces
        this.player.velocity.x -= this.player.velocity.x * 10 * delta;
        this.player.velocity.z -= this.player.velocity.z * 10 * delta;
        this.player.velocity.y -= 10 * (this.player.mass) * delta;

        // normalized direction of the keys pressed
        this.player.feetDirection.z = Number( this.engine.inputManager.moveForward ) - Number( this.engine.inputManager.moveBackward );
        this.player.feetDirection.x = Number( this.engine.inputManager.moveRight ) - Number( this.engine.inputManager.moveLeft );
        this.player.feetDirection.normalize();

        // set velocities in absolute direction
        if ( this.engine.inputManager.moveForward || this.engine.inputManager.moveBackward ) {
            this.player.velocity.z += this.player.feetDirection.z * this.player.speed * delta;
        }
        if ( this.engine.inputManager.moveLeft || this.engine.inputManager.moveRight ) {
            this.player.velocity.x += this.player.feetDirection.x * this.player.speed * delta;
        }

        // handle running
        if (this.engine.inputManager.isRunning) {
            if (this.player.velocity.z > 0) {
                this.player.velocity.z *= this.player.runningSpeedBoost
            }
        }

        // gravity
        this.camera.position.y += ( this.player.velocity.y * delta );

        // not falling through ground / jump
        if ( this.camera.position.y < 1.8 ) {
            this.engine.inputManager.canJump = true // TODO event()
            this.player.velocity.y = 0;
            this.camera.position.y = 1.8;
        }
    }

    movePlayerCamera(velocity) {
        const camera = this.camera;
        const newPosition = this.camera.position.clone();

        // set x velocity facing the camera
        this._direction.setFromMatrixColumn(camera.matrix, 0);
        newPosition.addScaledVector(this._direction, velocity.x);

        // update world direction x
        this._worldDirection.multiplyScalar(0); // reset
        this._worldDirection.addScaledVector(this._direction, velocity.x);

        // set z velocity facing the camera
        this._direction.crossVectors(camera.up, this._direction);
        newPosition.addScaledVector(this._direction, velocity.z);

        // update world direction z
        this._worldDirection.addScaledVector(this._direction, velocity.z);
        this._worldDirection.normalize()

        camera.position.copy(newPosition)

        // let hitbox = new Box3()
        // hitbox.setFromCenterAndSize(newPosition, new Vector3(.5, 1.8, .5))
        // let collisions = [];

        // BUILDINGS
        // for (const [name, aabb] of this.engine.game.three.WALLS) {
        //     if (aabb.intersectsBox(hitbox)) {
        //         collisions.push(aabb)
        //     }
        // }

        // if (collisions.length === 0) {
        //     camera.position.copy(newPosition);
        // } else {
        //     if (collisions.length === 2) {
        //         // block camera on wall
        //         camera.position.copy(this._lastPosition)
        //     } else {
        //         let aabb = collisions[0]
        //
        //         // TODO slider le perso sur la normal du mur
        //
        //         camera.position.copy(this._lastPosition)
        //     }
        // }

        this._lastPosition.copy(camera.position);
    }

    connect() {
        this.domElement.ownerDocument.addEventListener('mousemove', this._onMouseMove);
        this.domElement.ownerDocument.addEventListener('pointerlockchange', this._onPointerlockChange);
        this.domElement.ownerDocument.addEventListener('pointerlockerror', this._onPointerlockError);
    }

    disconnect() {
        this.domElement.ownerDocument.removeEventListener('mousemove', this._onMouseMove);
        this.domElement.ownerDocument.removeEventListener('pointerlockchange', this._onPointerlockChange);
        this.domElement.ownerDocument.removeEventListener('pointerlockerror', this._onPointerlockError);
    }

    cleanup() {
        this.disconnect();
    }

    lock() {
        this.domElement.requestPointerLock({
            unadjustedMovement: true,
        });
    }

    unlock() {
        this.domElement.ownerDocument.exitPointerLock();
    }

    getDirection(v) {
        return v?.set(0, 0, -1).applyQuaternion(this.camera.quaternion) ?? this.zeroVector;
    }

}

// event listeners

function onMouseMove(event) {
    if (this.isLocked === false) return;

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    // TODO make it work again
    // window.ZombieGame.game.weaponManager.pointer.set(event.clientX, event.clientY)

    const camera = this.camera;
    this._euler.setFromQuaternion(camera.quaternion);
    this._euler.y -= movementX * 0.002 * this.pointerSpeed;
    this._euler.x -= movementY * 0.002 * this.pointerSpeed;
    this._euler.x = Math.max(_PI_2 - this.maxPolarAngle, Math.min(_PI_2 - this.minPolarAngle, this._euler.x));
    camera.quaternion.setFromEuler(this._euler);
    this.dispatchEvent(_changeEvent);
}

function onPointerlockChange() {

    if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
        this.dispatchEvent(_lockEvent);
        this.isLocked = true;
    } else {
        this.dispatchEvent(_unlockEvent);
        this.isLocked = false;
    }

}

function onPointerlockError() {
    console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
}



