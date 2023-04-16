import * as THREE from "three";
import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";

export default class GraphicsWorld {

    constructor(worldWidth, worldDepth) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xefd1b5 );
        this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

        this.controls = new PointerLockControls( this.camera, this.renderer.domElement );

        this.ambientLight = new THREE.AmbientLight( 0x666666 ); // soft white light
        this.scene.add( this.ambientLight );

        //Create a DirectionalLight and turn on shadows for the light
        this.directionalLight = new THREE.DirectionalLight( 0xffffff, .5 );
        this.directionalLight.position.set( 0, 15, 0 ); //default; light shining from top
        this.directionalLight.castShadow = true; // default false
        this.scene.add( this.directionalLight );

        // //Create a helper for the shadow camera (optional)
        // const helper = new THREE.CameraHelper( light.shadow.camera );
        // scene.add( helper );

        this.groundGeometry = new THREE.PlaneGeometry( worldWidth, worldDepth);
        this.groundGeometry.rotateX( - Math.PI / 2 );
        this.groundMesh = new THREE.Mesh( this.groundGeometry, new THREE.MeshStandardMaterial( {color: 0x4DC2E8 }) );
        this.groundMesh.position.y = -1
        this.groundMesh.receiveShadow = true
        this.scene.add(this.groundMesh)

        this.bind()
    }

    bind() {
        document.addEventListener('click', () => this.controls.lock())
        this.controls.addEventListener( 'lock', function () {});
        this.controls.addEventListener( 'unlock', function () {});

        window.addEventListener( 'resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        });
    }
}