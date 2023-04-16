import * as THREE from "three";
import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";

export default class GraphicsWorld {

    constructor(worldWidth, worldDepth) {
        const world = new CANNON.World()
        world.gravity.set(0, -9.82, 0)

        const normalMaterial = new THREE.MeshNormalMaterial()
        const phongMaterial = new THREE.MeshPhongMaterial()

        this.bind()
    }

    bind() {

    }
}