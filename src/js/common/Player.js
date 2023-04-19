import * as THREE from "three"
import * as CANNON from "cannon-es"
import {CSS2DObject, CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const config = {
    width: 1,
    height: 1.8,
    depth: .5,
}
export default class Player {

    constructor(player) {
        this.socketId = player.socketId

        // three init
        this.geometry = new THREE.BoxGeometry( config.width, config.height, config.depth );
        this.material = new THREE.MeshStandardMaterial( { color: player.color, opacity: .2, transparent: true } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.set(2, 0, 2)
        window.ZombieGame.game.three.scene.add(this.mesh)

        this.gltf = undefined

        const loader = new GLTFLoader();

        loader.load(
            'src/assets/gltf/Soldier.glb',
            ( gltf ) => {
                this.gltf = gltf.scene
                this.gltf.scale.set(1, 1, 1);
                this.gltf.rotateY(Math.PI / 2);
                this.gltf.position.copy(this.mesh.position);
                window.ZombieGame.game.three.scene.add( this.gltf );
            }
        );
    }

    removeFromScene() {
        window.ZombieGame.game.three.scene.remove(this.mesh)
        window.ZombieGame.game.three.scene.remove(this.gltf)
    }
}