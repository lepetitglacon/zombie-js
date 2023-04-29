import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

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
        this.mesh.isZombie = true
        window.ZombieGame.game.three.scene.add(this.mesh)

        this.loader = new GLTFLoader();
        this.gltf = undefined
        this.loadGlft()

    }

    loadGlft() {
        this.loader.load(
            '../gltf/Soldier.glb',
            ( gltf ) => {
                this.gltf = gltf.scene

                this.gltf.children.pop()

                // console.log(this.gltf.children[0].children)
                for (const bodyPart of this.gltf.children[0].children) {
                    bodyPart.isZombie = true
                    bodyPart.zombieId = this.id
                }

                this.gltf.scale.set(.9, .9, .9);
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