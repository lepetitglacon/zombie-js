import {ArrowHelper, Box3, Euler, EventDispatcher, Vector3} from 'three';

const _changeEvent = {type: 'change'};
const _lockEvent = {type: 'lock'};
const _unlockEvent = {type: 'unlock'};

const _PI_2 = Math.PI / 2;

export default class PointerLockControls extends EventDispatcher {

    constructor(camera, domElement, engine) {
        super();

        this._euler = new Euler(0, 0, 0, 'YXZ');
        this._direction = new Vector3();
        this._lastPosition = new Vector3();
        this._worldDirection = new Vector3()

        this.camera = camera;
        this.domElement = domElement;
        this.engine = engine;

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

    /**
     * gives next position for collision testing
     * @param distance
     * @param times
     * @returns {*}
     */
    testMoveForward(distance, times = 1) {
        const camera = this.camera;
        const vec = this._direction.clone()
        vec.setFromMatrixColumn(camera.matrix, 0);
        vec.crossVectors(camera.up, vec);
        const pos = camera.position.clone()
        return pos.addScaledVector(vec, distance * times);
    }

    /**
     *
     * @param distance
     * @param times
     */
    testMoveRight(distance, times = 1) {
        const camera = this.camera;
        const vec = this._direction.clone()
        vec.setFromMatrixColumn(camera.matrix, 0);
        const pos = camera.position.clone()
        return pos.addScaledVector(vec, distance * times);
    }

    moveForward(distance) {
        const camera = this.camera;
        this._direction.setFromMatrixColumn(camera.matrix, 0);
        this._direction.crossVectors(camera.up, this._direction);
        camera.position.addScaledVector(this._direction, distance);
    }

    moveRight(distance) {
        const camera = this.camera;
        this._direction.setFromMatrixColumn(camera.matrix, 0);
        camera.position.addScaledVector(this._direction, distance);
    }

    /**
     *
     * @param velocity
     * @param times
     * @returns {{times: number, position: Vector3}}
     */
    testMove(velocity, times = 1) {
        const camera = this.camera;
        const pos = this.camera.position.clone();
        const dir = this._direction.clone();

        // set x velocity facing the camera
        dir.setFromMatrixColumn(camera.matrix, 0);
        pos.addScaledVector(dir, velocity.x);

        // set z velocity facing the camera
        dir.crossVectors(camera.up, dir);
        pos.addScaledVector(dir, velocity.z);

        return {position: pos, times: times};
    }

    move(velocity) {
        const camera = this.camera;
        const newPosition = this.camera.position.clone();
        const wallNormal = new Vector3();
        const slideFactor = .2;

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

        let hitbox = new Box3()
        hitbox.setFromCenterAndSize(newPosition, new Vector3(.5, 1.8, .5))

        let collisions = [];

        // BUILDINGS
        for (const [name, aabb] of this.engine.game.three.WALLS) {
            if (aabb.intersectsBox(hitbox)) {
                collisions.push(aabb)
            }
        }

        if (collisions.length === 0) {
            camera.position.copy(newPosition);
        } else {
            if (collisions.length === 2) {
                // block camera on wall
                camera.position.copy(this._lastPosition)
            } else {
                let aabb = collisions[0]

                // TODO slider le perso sur la normal du mur

                camera.position.copy(this._lastPosition)
            }
        }
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

    dispose() {
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

    getObject() { // retaining this method for backward compatibility
        return this.camera;
    }

    getDirection(v) {
        return v.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
    }

}

// event listeners

function onMouseMove(event) {

    if (this.isLocked === false) return;

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    window.ZombieGame.game.weaponHandler.pointer.set(event.clientX, event.clientY)

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



