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
        this.scene.background = new THREE.Color( 0xEEEEEE );
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

    update(delta) {
        console.log('running')


        this.renderer.render( this.scene, this.camera );
    }

    async init() {
        this.bind()

        // load 3D map from blender
        this.gltf = this.engine.modelManager.getModel('map')
        console.log('map gltf', this.gltf)
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



    setRendererElement(node) {
        node.appendChild( this.renderer.domElement )
        console.log('[THREE] DOM Renderer node has been set')
    }

    bind() {
        this.onResize_ = this.onResize.bind(this)
        window.addEventListener( 'resize', this.onResize_);
        window.addEventListener('beforeunload', this.onBeforeUnload);
    }

    cleanup() {
        window.removeEventListener( 'resize', this.onResize_);
        window.removeEventListener('beforeunload', this.onBeforeUnload);
    }

    onResize(e) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    onBeforeUnload() {
        // TODO
    }
}