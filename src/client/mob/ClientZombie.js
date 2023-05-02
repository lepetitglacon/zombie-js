import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import ModelManager from "../managers/ModelManager.js";

const config = {
    width: 1,
    height: 1.8,
    depth: .5,
}
export default class ClientZombie {
    constructor(zombie) {
        this.id = zombie.id

        this.maxHealth = 100
        this.health = this.maxHealth

        // three init
        this.geometry = new THREE.BoxGeometry( config.width, config.height, config.depth );
        this.material = new THREE.MeshStandardMaterial( { color: zombie.color, opacity: 0, transparent: true } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.set(zombie.position.x, zombie.position.y - 1, zombie.position.z)
        window.ZombieGame.game.three.scene.add(this.mesh)

        this.gltf = window.ZombieGame.modelManager.getModelCopy('player')
        this.prepareGltf()
    }

    prepareGltf() {
        this.gltf.children.pop()

        const material = new THREE.MeshStandardMaterial( { color: 0x339933} );

        for (const bodyPart of this.gltf.children[0].children) {
            bodyPart.isZombie = true
            bodyPart.zombieId = this.id
            bodyPart.material = material
        }

        this.gltf.scale.set(.9, .9, .9);
        this.gltf.rotateY(Math.PI / 2);
        this.gltf.position.copy(this.mesh.position);
        window.ZombieGame.game.three.scene.add( this.gltf );
    }

    removeFromScene() {
        window.ZombieGame.game.three.scene.remove(this.mesh)
        window.ZombieGame.game.three.scene.remove(this.gltf)
    }
}