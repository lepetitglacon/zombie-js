import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {Vector3} from "three";
import ZombieGame from "../ZombieGame.js";

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
        this.body = new Map()
        this.loadGlft()

        // const canvas = document.querySelector('canvas');
        // const followText = document.getElementById('follow-text');
        // let boxPosition = new THREE.Vector3();
        // let boxPositionOffset = new THREE.Vector3();
        // const Y_AXIS = new THREE.Vector3(0, 1, 0);
        //
        // // MOVE TO THE RIGHT OF THE CAMERA
        // boxPositionOffset.copy(this.gltf.mesh.position);
        // boxPositionOffset.sub(window.ZombieGame.game.three.camera.position);
        // boxPositionOffset.normalize();
        // boxPositionOffset.applyAxisAngle(Y_AXIS, - Math.PI / 2);
        // boxPositionOffset.multiplyScalar(0.5);
        // boxPositionOffset.y = 1.5;
        //
        // boxPosition.setFromMatrixPosition( this.gltf.mesh.matrixWorld )
        // boxPosition.add(boxPositionOffset);
        // boxPosition.project(window.ZombieGame.game.three.camera);
        //
        // let rect = canvas.getBoundingClientRect();
        // let widthHalf = canvas.width / 2, heightHalf = canvas.height / 2;
        // boxPosition.x = rect.left + ( boxPosition.x * widthHalf ) + widthHalf;
        // boxPosition.y = rect.top - ( boxPosition.y * heightHalf ) + heightHalf;
        //
        // followText.style.top = `${boxPosition.y}px`;
        // followText.style.left = `${boxPosition.x}px`;


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
                    if (bodyPart.parent.wholeBody === undefined) {
                        bodyPart.wholeBody = this.body
                    }
                    this.body.set(bodyPart.uuid, bodyPart)
                }

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