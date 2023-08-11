import * as THREE from "three";
import PointerLockControls from "../input/PointerLockControls.js";
import GameEngine from "../GameEngine.js";
import {Box3} from "three";
import {VertexNormalsHelper} from "three/addons/helpers/VertexNormalsHelper.js";
import Door from "./Door/Door.js";

export default class ThreeWorld {

    constructor({engine}) {
        this.engine = engine

        this.WALLS = new Map()
        this.DOORS = new Map()

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xFFFFFF );
        this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

        this.camera = new THREE.PerspectiveCamera(
            90,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.y = 5

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.ambientLight = new THREE.AmbientLight( 0x666666 ); // soft white light
        this.scene.add( this.ambientLight );

        //Create a DirectionalLight and turn on shadows for the light
        this.directionalLight = new THREE.DirectionalLight( 0xffffff, .5 );
        this.directionalLight.position.set( 0, 15, 0 ); //default; light shining from top
        this.directionalLight.castShadow = true; // default false
        this.scene.add( this.directionalLight );

        this.renderer.render( this.scene, this.camera );
    }

    update() {
        console.log('running')

        this.renderer.render( this.scene, this.camera );
    }

    async init() {


        // this.engine.gui.addFolder('controls')
        // this.engine.gui.addToFolder('controls', this.camera.position, 'x', -1000, 1000)
        // this.engine.gui.addToFolder('controls', this.camera.position, 'y', -1000, 1000)
        // this.engine.gui.addToFolder('controls', this.camera.position, 'z', -1000, 1000)

        this.controls = new PointerLockControls( this.camera, this.renderer.domElement, this.engine );
        this.controls.pointerSpeed = .27

        this.bind()

        // 3D map from blender
        this.gltf = this.engine.modelManager.getModel('map')
        console.log(this.gltf)
        this.scene.add(this.gltf)
        await this.parseMap()
    }

    async parseMap() {
        for (const i in this.gltf.children) {
            const obj = this.gltf.children[i]
            const type = obj.userData.type ?? ''

            let aabb
            let aabbHelper
            let normalHelper

            switch (type) {

                case 'Spawner':
                    break;

                case 'Building':

                    // obj.geometry.computeBoundingBox()
                    //
                    // aabb = new Box3()
                    // aabb.setFromObject(obj)
                    // this.WALLS.set(obj.name, aabb)
                    //
                    // aabbHelper = new THREE.Box3Helper( aabb, 0xff0000 );
                    // this.scene.add( aabbHelper );
                    //
                    // normalHelper = new VertexNormalsHelper( obj, 1, 0xffffff );
                    // this.scene.add( normalHelper );

                    break;

                case 'Door':
                    // const door = new Door(obj)
                    //
                    // this.DOORS.set(obj.name, door)
                    // this.WALLS.set(obj.name, door.aabb)

                    break;

                case 'Floor':
                    break;
                default:
                    break;
            }
        }
        // this.engine.serverConnector.socket.emit('map_loaded_doors')
    }

    bind() {
        this.controls.addEventListener( 'lock', (e) => {
            // this.engine.state = GameEngine.STATE.GAME

            // if (window.ZombieGame.menu.isOpen()) {
            //     window.ZombieGame.menu.close()
            // }
        });
        this.controls.addEventListener( 'unlock', (e) => {
            // if (this.engine.chat.isOpen) {
            //
            // } else {
            //     // need this to open the menu on escape key
            //     this.engine.menu.open()
            // }
        });

        window.addEventListener( 'resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        });

        /**
         * Save player config in localstorage
         */
        window.addEventListener('beforeunload', function (e) {
            // e.preventDefault();

            console.log('saved config in localStorage')
            // TODO
            console.log('bye')
        });
    }



    setRendererElement(node) {
        console.log('in three div', this.threeDivRef)
        node.appendChild( this.renderer.domElement )
    }
}