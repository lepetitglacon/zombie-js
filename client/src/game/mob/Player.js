import * as THREE from "three"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ModelManager from "../managers/ModelManager.js";

const config = {
    width: 1,
    height: 1.8,
    depth: .5,
}
export default class Player {

    constructor({engine, player}) {
        this.engine = engine
        console.log(player)

        this._id = player._id
        this.socketId = player.socketId
        this.gamename = player.gamename
        this.points = player.points
        this.color = player.color

        // gameplay
        this.maxHealth = 100
        this.health = this.maxHealth

        // three init
        // this.geometry = new THREE.BoxGeometry( config.width, config.height, config.depth );
        // this.material = new THREE.MeshStandardMaterial( { color: this.color, opacity: 0, transparent: true } );
        // this.mesh = new THREE.Mesh( this.geometry, this.material );
        // this.mesh.position.copy(player.position)
        // window.ZombieGame.game.three.scene.add(this.mesh)

        this.model = this.engine.modelManager.getModelCopy('player')
        this.prepareGltf()

        // // sound
        // this.sound = undefined
        // this.sound = window.ZombieGame.soundManager.loadAndGetPositionalSound(
        //     'weapon_pistol_shot_' + this.socketId,
        //     'assets/sound/gunshot.wav'
        // )
        //
        // // TODO https://web.dev/webaudio-positional-audio/
        // this.knifeSound = undefined
        // this.knifeSound = window.ZombieGame.soundManager.loadAndGetPositionalSound(
        //     'weapon_knife_shot_' + this.socketId,
        //     'assets/sound/knife.wav'
        // )
    }

    prepareGltf() {
        // this.model.remove(this.model.getObjectByName('Plane'))
        // this.model.scale.set(.9, .9, .9);
        // this.model.rotateY(Math.PI / 2);
        // this.model.position.copy(this.mesh.position);
        console.log(this.model)
        const material = new THREE.MeshStandardMaterial({color: this.color})
        // for (const bodyPart of this.model.children[0].children) {
        //     bodyPart.isPlayer = true
        //     bodyPart.playerId = this.socketId
        //     if (bodyPart.name === 'Head') {
        //         bodyPart.material = material
        //     }
        // }
        this.engine.three.scene.add(this.model)
    }

    removeFromScene() {
        // this.engine.game.three.scene.remove(this.mesh)
        this.engine.game.three.scene.remove(this.model)
    }
}