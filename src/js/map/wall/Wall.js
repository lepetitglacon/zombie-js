import * as THREE from "three";
import * as CANNON from "cannon-es";

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
        window.ZombieGame.game.three.scene.add(this.mesh)

        this.shape = new CANNON.Box(new CANNON.Vec3(10, 0, 0.5))
        this.body = new CANNON.Body({ mass: 1 })
        this.body.addShape(this.shape)
        this.body.position.set(this.mesh.x, this.mesh.y, this.mesh.z)
        window.ZombieGame.game.world.addBody(this.body)


    }

    randomColor() {
        let color = "0x" + Math.floor(Math.random()*16777215).toString(16);
        return parseInt(color)
    }

}