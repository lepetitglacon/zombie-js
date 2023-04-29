import * as THREE from "three"
import * as CANNON from "cannon-es"
import {CSS2DObject, CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import SoundManager from "../managers/SoundManager.js";

const config = {
    width: 1,
    height: 1.8,
    depth: .5,
}
export default class Player {

    constructor(player) {
        this.socketId = player.socketId
        this.username = player.username

        // gameplay
        this.maxHealth = 100
        this.health = this.maxHealth

        // three init
        this.geometry = new THREE.BoxGeometry( config.width, config.height, config.depth );
        this.material = new THREE.MeshStandardMaterial( { color: player.color, opacity: 0, transparent: true } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.set(2, 0, 2)
        window.ZombieGame.game.three.scene.add(this.mesh)

        this.gltf = undefined

        // sound
        this.sound = undefined


        const loader = new GLTFLoader();
        loader.load(
            '../gltf/Soldier.glb',
            ( gltf ) => {
                this.gltf = gltf.scene

                // remove object scene
                this.gltf.remove(this.gltf.getObjectByName('Plane'))

                this.gltf.scale.set(.9, .9, .9);
                this.gltf.rotateY(Math.PI / 2);
                this.gltf.position.copy(this.mesh.position);
                for (let i in this.gltf.children[0].children) {
                    this.gltf.children[0].children[i].material.color.set(player.color)
                    this.gltf.children[0].children[i].material.opacity = 1
                }

                // add sounds
                // this.sound = window.ZombieGame.game.soundManager.getPositional('weapon_pistol_shot')
                this.sound = window.ZombieGame.game.soundManager.loadAndGetPositionalSound(
                    'weapon_pistol_shot_' + this.socketId,
                    'src/client/assets/sound/gunshot.wav'
                    )
                // this.gltf.add(this.sound)

                window.ZombieGame.game.three.scene.add( this.gltf );
            }
        );
    }

    removeFromScene() {
        window.ZombieGame.game.three.scene.remove(this.mesh)
        window.ZombieGame.game.three.scene.remove(this.gltf)
    }
}