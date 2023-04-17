import * as THREE from "three"
import * as CANNON from "cannon-es"

const config = {
    width: 1,
    height: 1.8,
    depth: .5,
}
export default class Player {

    constructor(socketId) {
        this.socketId = socketId

        // three init
        this.geometry = new THREE.BoxGeometry( config.width, config.height, config.depth );
        this.material = new THREE.MeshStandardMaterial( { color: 0xFFB769 } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.set(2, 0, 2)
        window.ZombieGame.game.three.scene.add(this.mesh)

        // cannon init
        // this.body = new CANNON.Body({
        //     mass: 90 // mass == 0 makes the body static
        // });
        // this.shape = new CANNON.Box(new CANNON.Vec3(config.width, config.height, config.depth));
        // this.body.addShape(this.shape);
        // window.ZombieGame.game.cannon.world.addBody(this.body)

        console.log('Added ' + this.socketId + ' to world')
    }

}