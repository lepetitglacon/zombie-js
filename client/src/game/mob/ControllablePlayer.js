import * as THREE from "three";
import {Box3, Box3Helper, Vector3} from "three";
import GameEngine from "../GameEngine.js";
import PointerLockControls from "../input/PointerLockControls";

export default class ControllablePlayer {


    constructor({engine}) {
        this.engine = engine

        // game attributes
        this.maxHealth = 100
        this.health = this.maxHealth

        // movement
        this.controls = new PointerLockControls({
            camera: this.engine.three.camera,
            domElement: this.engine.three.renderer.domElement,
            engine: this.engine,
            player: this
        } );
        this.controls.pointerSpeed = .27
        
        this.speed = 50
        this.runningSpeedBoost = 1.05
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

        // init
        this.position = this.engine.three.camera.position
        this.lastPosition = this.engine.three.camera.position.clone()
    }

    update(delta) {

        // update position
        this.controls.update(delta)
    }
}