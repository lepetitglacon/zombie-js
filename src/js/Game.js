import * as CANNON from "cannon-es";
import * as THREE from "three";
import GraphicsWorld from "./map/world/GraphicsWorld";
import Map from "./map/Map";
import InputManager from "./input/InputManager";

export default class Game {

    constructor() {
        this.prevTime = performance.now();
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();


        this.inputManager = new InputManager()

        this.three = new GraphicsWorld(500, 500)
        // this.world = new PhysicsWorld()

        this.map = new Map(this.three.scene)
        this.animate()
    }

    initCannonWorld() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, 0, -9.82); // m/s²

        // Create a plane
        var groundBody = new CANNON.Body({
            mass: 0 // mass == 0 makes the body static
        });
        var groundShape = new CANNON.Plane();
        groundBody.addShape(groundShape);
        this.world.addBody(groundBody);
    }

    animate() {
        requestAnimationFrame( () => {this.animate()} );

        const time = performance.now();
        const delta = ( time - this.prevTime ) / 1000;

        this.three.update()

        if (this.three.controls.isLocked === true) {

            // stop forces
            this.velocity.x -= this.velocity.x * 10 * delta;
            this.velocity.z -= this.velocity.z * 10 * delta;
            this.velocity.y -= 9.8 * window.ZombieGame.player.mass * delta; // 100.0 = mass

            this.direction.z = Number( this.inputManager.moveForward ) - Number( this.inputManager.moveBackward );
            this.direction.x = Number( this.inputManager.moveRight ) - Number( this.inputManager.moveLeft );
            this.direction.normalize();

            if ( this.inputManager.moveForward || this.inputManager.moveBackward ) this.velocity.z -= this.direction.z * window.ZombieGame.player.speed * delta;
            if ( this.inputManager.moveLeft || this.inputManager.moveRight ) this.velocity.x -= this.direction.x * window.ZombieGame.player.speed * delta;

            this.three.controls.moveRight( - this.velocity.x * delta );
            this.three.controls.moveForward( - this.velocity.z * delta );
            this.three.controls.getObject().position.y += ( this.velocity.y * delta ); // new behavior

            if ( this.three.controls.getObject().position.y < 0 ) {
                this.velocity.y = 0;
                this.three.controls.getObject().position.y = 0;
            }
        }

        this.prevTime = time;
        this.three.renderer.render( this.three.scene, this.three.camera );
    }

}