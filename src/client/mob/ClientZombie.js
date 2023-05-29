import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import ModelManager from "../managers/ModelManager.js";
import {Box3, Box3Helper, SkinnedMesh} from "three";

const config = {
    width: .6,
    height: 1.3,
    depth: .3,
}
export default class ClientZombie {
    constructor(zombie) {
        this.id = zombie.id

        this.maxHealth = 100
        this.health = this.maxHealth

        this.zombieMaterial = new THREE.MeshStandardMaterial( { color: 0x339933} );

        // three init
        this.geometry = new THREE.BoxGeometry( config.width, config.height, config.depth );
        this.material = new THREE.MeshStandardMaterial( { color: zombie.color, opacity: .5, transparent: true } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.name = 'Zombie Mesh ' + this.id
        this.mesh.position.set(zombie.position.x, zombie.position.y - 1, zombie.position.z)
        window.ZombieGame.game.three.scene.add(this.mesh)

        // this.gltf = window.ZombieGame.modelManager.getModelCopy('player')
        this.gltf = window.ZombieGame.modelManager.getModelSkeletonCopy('player')
        this.prepareGltf()


    }

    prepareGltf() {

        console.log(this.gltf)

        // add animation
        // this.animationManager = new THREE.AnimationMixer(this.gltf)
        // const clip = THREE.AnimationClip.findByName(window.ZombieGame.modelManager, 'walking')
        // const action = this.animationManager.clipAction(clip)
        // action.play()
        //
        // // children
        // for (const bodyPart of this.gltf.children[0].children) {
        //     bodyPart.isZombie = true
        //     bodyPart.zombieId = this.id
        //     bodyPart.material = this.zombieMaterial
        // }
        //
        // // properties
        // this.gltf.isZombie = true
        // this.gltf.name = 'Zombie ' + this.id
        // this.gltf.material = this.zombieMaterial
        //
        // // transform
        // this.gltf.scale.setScalar(1)
        // this.gltf.position.copy(this.mesh.position);


        this.aabb = new Box3()
        this.aabb.setFromObject(this.gltf)


        // this.mesh.updateMatrix();
        // this.mesh.updateMatrixWorld();
        // this.mesh.geometry.computeBoundingBox()

        this.meshHelper = new Box3Helper(this.aabb)
        window.ZombieGame.game.three.scene.add(this.meshHelper)



        window.ZombieGame.game.three.scene.add( this.gltf );
    }

    update() {
        this.aabb.setFromObject(this.gltf);
    }

    removeFromScene() {
        window.ZombieGame.game.three.scene.remove(this.mesh)
        window.ZombieGame.game.three.scene.remove(this.gltf)
    }
}