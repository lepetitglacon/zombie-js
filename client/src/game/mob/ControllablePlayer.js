import * as THREE from "three";
import {Box3, Box3Helper, Vector3} from "three";
import GameEngine from "../GameEngine.js";
import PointerLockControls from "../input/PointerLockControls";

export default class ControllablePlayer extends EventTarget {


    constructor({engine})  {
        super()
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

        this.points = 0

        this.velocity = new THREE.Vector3();
        this.feetDirection = new THREE.Vector3();
        this.lookDirection = new THREE.Vector3();
        this.lastDirection = this.lookDirection.clone()

        // init
        this.position = this.engine.three.camera.position
        this.lastPosition = this.engine.three.camera.position.clone()

        // shape
        this.height = 1.8
        this.width = .5
        this.depth = .5

        // mesh
        this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth)
        this.material = new THREE.MeshStandardMaterial({
            color: 0xee2222,
            wireframe: true,
            opacity: .5,
            transparent: true
        })
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.copy(this.position)
        this.mesh.geometry.computeBoundingBox()
        this.engine.three.scene.add(this.mesh)

        this.aabb = new Box3()
        this.aabb.setFromObject(this.mesh)

        this.aabbHelper = new Box3Helper(this.aabb)
        this.engine.three.scene.add(this.aabbHelper)

        // model



        this.bind()
    }

    update(delta) {

        // update position
        this.controls.update(delta)
        this.mesh.position.copy(this.controls.camera.position)
        this.aabb.setFromObject(this.mesh)
    }

    bind() {
        this.addEventListener('player_shot', e => {
            if (e.socketId === this.engine.socketHandler.socket.id) {
                this.points += e.points
                this.dispatchEvent(new Event('points'))
            }
        })
    }
}