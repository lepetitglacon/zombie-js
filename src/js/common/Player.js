import * as THREE from "three"

export default class Player {

    constructor(socketId) {
        this.socketId = socketId

        // three init
        this.geometry = new THREE.BoxGeometry( 1, 1.8, .5 );
        this.material = new THREE.MeshStandardMaterial( { color: 0xFFB769 } );
        this.body = new THREE.Mesh( this.geometry, this.material );
        this.body.position.set(2, 0, 2)

        window.ZombieGame.scene.add(this.body)
        console.log('Added ' + this.socketId + ' to world')
    }

}