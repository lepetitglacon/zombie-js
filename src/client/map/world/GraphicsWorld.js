import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugRenderer from "cannon-es-debugger";
import PointerLockControls from "../../input/PointerLockControls.js";
import GameEngine from "../../GameEngine.js";
import {Box3} from "three";
import {VertexNormalsHelper} from "three/addons/helpers/VertexNormalsHelper.js";
import Door from "../Door/Door.js";

// assets
import "../../assets/gltf/maps/flora_square.glb"
// import "../../assets/img/skyboxes/interstellar_skybox/xpos.png"
// import "../../assets/img/skyboxes/interstellar_skybox/xneg.png"
// import "../../assets/img/skyboxes/interstellar_skybox/ypos.png"
// import "../../assets/img/skyboxes/interstellar_skybox/yneg.png"
// import "../../assets/img/skyboxes/interstellar_skybox/zpos.png"
// import "../../assets/img/skyboxes/interstellar_skybox/zneg.png"

export default class GraphicsWorld {

    constructor() {
        this.WALLS = new Map()
        this.DOORS = new Map()

        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
        })

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x222222 );
        this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

        this.cannonDebugRenderer = new CannonDebugRenderer(this.scene, this.world)

        this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.createPlayer()

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

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

        // skybox
        // let materialArray = [];
        // let texture_ft = new THREE.TextureLoader().load( '../img/skyboxes/interstellar_skybox/xpos.png');
        // let texture_bk = new THREE.TextureLoader().load( '../img/skyboxes/interstellar_skybox/xneg.png');
        // let texture_up = new THREE.TextureLoader().load( '../img/skyboxes/interstellar_skybox/xpos.png');
        // let texture_dn = new THREE.TextureLoader().load( '../img/skyboxes/interstellar_skybox/xneg.png');
        // let texture_rt = new THREE.TextureLoader().load( '../img/skyboxes/interstellar_skybox/xpos.png');
        // let texture_lf = new THREE.TextureLoader().load( '../img/skyboxes/interstellar_skybox/xneg.png');
        //
        // materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
        // materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
        // materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
        // materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
        // materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
        // materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
        //
        // for (let i = 0; i < 6; i++)
        //     materialArray[i].side = THREE.BackSide;
        //
        // let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
        // let skybox = new THREE.Mesh( skyboxGeo, materialArray );
        // this.scene.add( skybox );

    }

    init() {
        this.engine = window.ZombieGame
        this.engine.gui.addFolder('controls')
        this.engine.gui.addToFolder('controls', this.camera.position, 'x', -1000, 1000)
        this.engine.gui.addToFolder('controls', this.camera.position, 'y', -1000, 1000)
        this.engine.gui.addToFolder('controls', this.camera.position, 'z', -1000, 1000)

        this.controls = new PointerLockControls( this.camera, this.renderer.domElement, this.engine );
        this.controls.pointerSpeed = .27

        this.bind()

        this.parseMap()
    }

    parseMap() {
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

                    obj.geometry.computeBoundingBox()

                    aabb = new Box3()
                    aabb.setFromObject(obj)
                    this.WALLS.set(obj.name, aabb)

                    aabbHelper = new THREE.Box3Helper( aabb, 0xff0000 );
                    this.scene.add( aabbHelper );

                    normalHelper = new VertexNormalsHelper( obj, 1, 0xffffff );
                    this.scene.add( normalHelper );

                    break;

                case 'Door':
                    const door = new Door(obj)

                    this.DOORS.set(obj.name, door)
                    this.WALLS.set(obj.name, door.aabb)

                    break;

                case 'Floor':
                    break;
                default:
                    break;
            }
        }
        this.engine.serverConnector.socket.emit('map_loaded_doors')
    }

    createPlayer() {

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

    drawObb(obb, color = 0xffffff, matrix) {
        const material = new THREE.LineBasicMaterial( { color: color } );
        const points = [];

        const x = obb.center.x - obb.halfSize.x
        const y = obb.center.y - obb.halfSize.y
        const z = obb.center.z - obb.halfSize.z

        const width = obb.halfSize.x * 2
        const height = obb.halfSize.y * 2
        const depth = obb.halfSize.z * 2

        const p1 = new THREE.Vector3(x, y, z)
        const p2 = new THREE.Vector3(x, y, z + depth)
        const p3 = new THREE.Vector3(x + width, y, z + depth)
        const p4 = new THREE.Vector3(x + width, y, z)
        const p5 = new THREE.Vector3(x, y, z)

        const p6 = new THREE.Vector3(x, y + height, z)
        const p7 = new THREE.Vector3(x, y + height, z + depth)
        const p8 = new THREE.Vector3(x + width, y + height, z + depth)
        const p9 = new THREE.Vector3(x + width, y + height, z)
        const p10 = new THREE.Vector3(x, y + height, z)

        const p11 = new THREE.Vector3(x, y, z + depth)
        const p12 = new THREE.Vector3(x, y + height, z + depth)
        const p13 = new THREE.Vector3(x + width, y, z + depth)
        const p14 = new THREE.Vector3(x + width, y + height, z + depth)
        const p15 = new THREE.Vector3(x + width, y, z)
        const p16 = new THREE.Vector3(x + width, y + height, z)

        points.push(p1)
        points.push(p2)
        points.push(p3)
        points.push(p4)
        points.push(p5)
        points.push(p6)
        points.push(p7)
        points.push(p8)
        points.push(p9)
        points.push(p10)
        points.push(p11)
        points.push(p12)
        points.push(p13)
        points.push(p14)
        points.push(p15)
        points.push(p16)

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, material );
        line.material.linewidth = 2
        this.scene.add( line );
    }
}