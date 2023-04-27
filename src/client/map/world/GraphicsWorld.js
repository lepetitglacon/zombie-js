import * as THREE from "three";
import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";
import WeaponHandler from "../../weapon/WeaponHandler.js";

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

        this.groundGeometry = new THREE.PlaneGeometry( worldWidth, worldDepth);
        this.groundGeometry.rotateX( - Math.PI / 2 );
        this.groundMesh = new THREE.Mesh( this.groundGeometry, new THREE.MeshStandardMaterial( {color: 0x4DC2E8 }) );
        this.groundMesh.position.y = -1
        this.groundMesh.receiveShadow = true
        this.groundMesh.name = "Ground"
        this.scene.add(this.groundMesh)



        this.bind()
    }

    init() {
        window.ZombieGame.game.gui.addFolder('controls')
        window.ZombieGame.game.gui.addToFolder('controls', this.camera.position, 'x', -1000, 1000)
        window.ZombieGame.game.gui.addToFolder('controls', this.camera.position, 'y', -1000, 1000)
        window.ZombieGame.game.gui.addToFolder('controls', this.camera.position, 'z', -1000, 1000)
    }

    bind() {
        document.addEventListener('click', () => {
            this.controls.lock()
            if (!window.ZombieGame.chatInput.classList.contains('hidden')) {
                window.ZombieGame.chatInput.classList.toggle('hidden')
                window.ZombieGame.chatInput.value = ''
            }
            if (!window.ZombieGame.optionMenu.classList.contains('d-none')) {
                !window.ZombieGame.optionMenu.classList.toggle('d-none')
            }
        })
        this.controls.addEventListener( 'lock', function () {});
        this.controls.addEventListener( 'unlock', function () {});

        window.addEventListener( 'resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        });
    }

    update() {


    }
}