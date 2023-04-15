import "./assets/css/style.css"

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import InputManager from "./js/input/InputManager";
import Map from "./js/map/Map";
import Room from "./js/map/room/Room";
import Wall from "./js/map/wall/Wall";

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xefd1b5 );
// scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const ambientLight = new THREE.AmbientLight( 0x666666 ); // soft white light
scene.add( ambientLight );

//Create a DirectionalLight and turn on shadows for the light
const light = new THREE.DirectionalLight( 0xffffff, .5 );
light.position.set( 0, 15, 0 ); //default; light shining from top
light.castShadow = true; // default false
scene.add( light );

light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default

//Create a helper for the shadow camera (optional)
const helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );

const controls = new PointerLockControls( camera, renderer.domElement );

const player = {
    speed: 80,
    mass: 90
}

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

const map = new Map()
map.addRoom(room1)
map.addToScene(scene)

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshStandardMaterial( { color: 0xFFB769 } );
const cube = new THREE.Mesh( geometry, material );
cube.castShadow = true
cube.receiveShadow = true
scene.add( cube );

const planeGeometry = new THREE.PlaneGeometry( map.width, map.depth);
planeGeometry.rotateX( - Math.PI / 2 );
const mesh = new THREE.Mesh( planeGeometry, new THREE.MeshStandardMaterial( {color: 0x4DC2E8 }) );
mesh.position.y = -1
mesh.receiveShadow = true
scene.add(mesh)

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const inputManager = new InputManager()


window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});

document.addEventListener('click', () => controls.lock())
controls.addEventListener( 'lock', function () {});
controls.addEventListener( 'unlock', function () {});

function animate() {
    requestAnimationFrame( animate );

    const time = performance.now();
    const delta = ( time - prevTime ) / 1000;

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    if (controls.isLocked === true) {

        // stop forces
        velocity.x -= velocity.x * 10 * delta;
        velocity.z -= velocity.z * 10 * delta;
        velocity.y -= 9.8 * player.mass * delta; // 100.0 = mass

        direction.z = Number( inputManager.moveForward ) - Number( inputManager.moveBackward );
        direction.x = Number( inputManager.moveRight ) - Number( inputManager.moveLeft );
        direction.normalize();

        if ( inputManager.moveForward || inputManager.moveBackward ) velocity.z -= direction.z * player.speed * delta;
        if ( inputManager.moveLeft || inputManager.moveRight ) velocity.x -= direction.x * player.speed * delta;

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        controls.getObject().position.y += ( velocity.y * delta ); // new behavior

        if ( controls.getObject().position.y < 0 ) {
            velocity.y = 0;
            controls.getObject().position.y = 0;
        }
    }

    prevTime = time;
    renderer.render( scene, camera );
}

animate();