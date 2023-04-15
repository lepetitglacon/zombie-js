import Wall from "./wall/Wall";
import * as THREE from "three";
import Room from "./room/Room";

export default class Map {

    constructor(scene) {
        this.width = 500
        this.depth = 500

        this.rooms = []

        this.scene = scene

        this.init()
    }

    addRoom(room) {
        this.rooms.push(room)
    }

    addToScene() {
        for (const roomIndex in this.rooms) {
            this.rooms[roomIndex].addToScene(this.scene)
        }
    }

    init() {

        const wall1 = new Wall(new THREE.Vector3(10, 3, .5))
        const wall2 = new Wall(new THREE.Vector3(10, 3, .5))
        const wall3 = new Wall(new THREE.Vector3(10, 3, .5))
        wall1.mesh.position.set(0, 0, 0)
        wall2.mesh.position.set(5, 0, 5)
        wall2.mesh.rotateY(Math.PI /2)
        wall3.mesh.position.set(0, 0, 10)

        const room1 = new Room()
        room1.addWall(wall1)
        room1.addWall(wall2)
        room1.addWall(wall3)

        this.addRoom(room1)
        this.addToScene()

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshStandardMaterial( { color: 0xFFB769 } );
        const cube = new THREE.Mesh( geometry, material );
        cube.castShadow = true
        cube.receiveShadow = true
        this.scene.add( cube );
    }

}