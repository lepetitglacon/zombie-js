import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from 'cannon-es-debugger'
export default class GraphicsWorld {

    constructor(worldWidth, worldDepth) {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // m/s²

        this.debugger = new CannonDebugger(window.ZombieGame.game.three.scene, this.world, {
            // options...
        })

        // Create a plane
        this.groundBody = new CANNON.Body({
            mass: 0
        });
        this.groundShape = new CANNON.Plane();
        this.groundBody.addShape(this.groundShape);
        this.groundBody.quaternion.setFromEuler(Math.PI / 2);
        this.groundBody.position.y = 0

        this.world.addBody(this.groundBody);

    }
}