import * as THREE from "three";
import PointerLockControls from "../../input/PointerLockControls.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
// import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";

// assets
import "../../assets/gltf/maps/scene.glb"
import "../../assets/gltf/maps/flora_square.glb"
import ModelManager from "../../managers/ModelManager.js";
import GameEngine from "../../GameEngine.js";

export default class GraphicsWorld {

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xefd1b5 );
        this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

        this.controls = new PointerLockControls( this.camera, this.renderer.domElement );
        this.controls.pointerSpeed = .27

        this.ambientLight = new THREE.AmbientLight( 0x666666 ); // soft white light
        this.scene.add( this.ambientLight );

        //Create a DirectionalLight and turn on shadows for the light
        this.directionalLight = new THREE.DirectionalLight( 0xffffff, .5 );
        this.directionalLight.position.set( 0, 15, 0 ); //default; light shining from top
        this.directionalLight.castShadow = true; // default false
        this.scene.add( this.directionalLight );

        // 3D map from blender
        this.gltf = window.ZombieGame.modelManager.getModel('map')
        this.scene.add(this.gltf)


        this.bind()
    }

    init() {
        this.engine = window.ZombieGame
        this.engine.gui.addFolder('controls')
        this.engine.gui.addToFolder('controls', this.camera.position, 'x', -1000, 1000)
        this.engine.gui.addToFolder('controls', this.camera.position, 'y', -1000, 1000)
        this.engine.gui.addToFolder('controls', this.camera.position, 'z', -1000, 1000)

        this.parseMap()
    }

    parseMap() {
        const spawners = []

        for (const i in this.gltf.children) {
            const obj = this.gltf.children[i]
            const type = obj.userData.type ?? ''
            switch (type) {
                case 'Spawner':
                    spawners.push(obj.position.clone())
                    break;
                default:
                    break;
            }
        }
        this.engine.serverConnector.socket.emit('register_spawner', spawners)
    }

    bind() {
        this.controls.addEventListener( 'lock', (e) => {
            this.engine.state = GameEngine.STATE.GAME

            // if (window.ZombieGame.menu.isOpen()) {
            //     window.ZombieGame.menu.close()
            // }
        });
        this.controls.addEventListener( 'unlock', (e) => {
            if (this.engine.chat.isOpen) {

            } else {
                // need this to open the menu on escape key
                this.engine.menu.open()
            }
        });

        window.addEventListener( 'resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        });
    }
}