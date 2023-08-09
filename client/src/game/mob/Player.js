import * as THREE from "three"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ModelManager from "../managers/ModelManager.js";

const config = {
    width: 1,
    height: 1.8,
    depth: .5,
}
export default class Player {

    constructor(player) {
        this.socketId = player.socketId
        this.username = player.username
        this.points = player.points
        this.color = player.color

        // gameplay
        this.maxHealth = 100
        this.health = this.maxHealth

        // three init
        this.geometry = new THREE.BoxGeometry( config.width, config.height, config.depth );
        this.material = new THREE.MeshStandardMaterial( { color: this.color, opacity: 0, transparent: true } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.copy(player.position)
        window.ZombieGame.game.three.scene.add(this.mesh)

        this.gltf = window.ZombieGame.modelManager.getModelCopy('player')
        this.prepareGltf()

        // sound
        this.sound = undefined
        this.sound = window.ZombieGame.soundManager.loadAndGetPositionalSound(
            'weapon_pistol_shot_' + this.socketId,
            'assets/sound/gunshot.wav'
        )

        // TODO https://web.dev/webaudio-positional-audio/
        this.knifeSound = undefined
        this.knifeSound = window.ZombieGame.soundManager.loadAndGetPositionalSound(
            'weapon_knife_shot_' + this.socketId,
            'assets/sound/knife.wav'
        )
    }

    prepareGltf() {
        this.gltf.remove(this.gltf.getObjectByName('Plane'))
        this.gltf.scale.set(.9, .9, .9);
        this.gltf.rotateY(Math.PI / 2);
        this.gltf.position.copy(this.mesh.position);
        const material = new THREE.MeshStandardMaterial({color: this.color})
        for (const bodyPart of this.gltf.children[0].children) {
            bodyPart.isPlayer = true
            bodyPart.playerId = this.socketId
            if (bodyPart.name === 'Head') {
                bodyPart.material = material
            }
        }
        window.ZombieGame.game.three.scene.add(this.gltf)
    }

    removeFromScene() {
        window.ZombieGame.game.three.scene.remove(this.mesh)
        window.ZombieGame.game.three.scene.remove(this.gltf)
    }
}