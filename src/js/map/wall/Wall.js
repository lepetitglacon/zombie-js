import * as THREE from "three";

export default class Wall {

    static TYPES = {
        WALL: 0,
        WEAPON: 1,
        DOOR: 2,
        DOORZOMBIE: 3,
    }

    constructor(geometry = THREE.Vector3(1, 1, 1), color = this.randomColor()) {
        this.type = Wall.TYPES.WALL

        this.geometry = new THREE.BoxGeometry(geometry.x, geometry.y, geometry.z);
        this.material = new THREE.MeshStandardMaterial( { color: color } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
    }

    addToScene(scene) {
        scene.add(this.mesh)
    }

    randomColor() {
        let color = "0x" + Math.floor(Math.random()*16777215).toString(16);
        console.log(color)
        return parseInt(color)
    }

}