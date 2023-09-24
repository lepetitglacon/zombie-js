import * as THREE from "three";
import PointerLockControls from "../input/PointerLockControls.js";
import GameEngine from "../GameEngine.js";
import {Box3} from "three";
import {VertexNormalsHelper} from "three/addons/helpers/VertexNormalsHelper.js";
import Door from "./Objects/Door.js";
import Utils from "../Utils";
import GunShop from "./Objects/GunShop";

export default class ThreeWorld extends EventTarget{

    constructor({engine}) {
        super()
        /** @type GameEngine */ this.engine = engine

        this.WALLS = new Map()

        /** @type {Map<Number, Door>} */ this.DOORS = new Map()
        /** @type {Map<Number, GunShop>} */ this.GUNSHOPS = new Map()

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

        this.renderer = new THREE.WebGLRenderer({
            alpha: true
        });
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

        // Doors hitbox
        let actionNeedToBeSet = false
        for (const [name, door] of this.DOORS) {
            if (this.engine.controllablePlayer.aabb.intersectsBox(door.actionAABB)) {
                const doorMessage = `Press F to Unlock Door : ${door.price}`
                Utils.dispatchEventTo('set_action', {
                    message: doorMessage,
                    action: () => {
                        door.buy()
                    }
                }, this.engine.actionManager)
                actionNeedToBeSet = true
            }
        }
        // GunShop hitbox
        for (const [name, door] of this.GUNSHOPS) {
            if (this.engine.controllablePlayer.aabb.intersectsBox(door.actionAABB)) {
                const doorMessage = `Press F to buy ${door.weaponName} : ${door.price}`
                Utils.dispatchEventTo('set_action', {
                    message: doorMessage,
                    action: () => {
                        door.buy()
                    }
                }, this.engine.actionManager)
                actionNeedToBeSet = true
            }
        }
        if (!actionNeedToBeSet) { // remove action if no action registered
            this.engine.actionManager.dispatchEvent(new Event('unset_action'))
        }

        this.renderer.render( this.scene, this.camera );
    }

    async init() {
        this.bind()

        // load 3D map from blender
        this.gltf = this.engine.modelManager.getModel('map')
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
                    const door = new Door({engine: this.engine, obj})
                    this.DOORS.set(door.id, door)
                    break;
                case 'GunShop':
                    const gunShop = new GunShop({engine: this.engine, obj})
                    this.GUNSHOPS.set(gunShop.id, gunShop)
                    break;
                case 'Floor':
                    break;
                default:
                    break;
            }
        }
    }



    setRendererElement(node) {
        node.appendChild( this.renderer.domElement )
        console.log('[THREE] DOM Renderer node has been set')
    }

    bind() {
        this.onResize_ = this.onResize.bind(this)
        window.addEventListener( 'resize', this.onResize_);
        window.addEventListener('beforeunload', this.onBeforeUnload);

        this.addEventListener('before_door_opening', (e) => {
            if (this.DOORS.has(e.doorId)) {
                this.DOORS.get(e.doorId).shake()
            }
        })
        this.addEventListener('door_open', (e) => {
            if (this.DOORS.has(e.doorId)) {
                this.DOORS.get(e.doorId).remove_()
            }
        })
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