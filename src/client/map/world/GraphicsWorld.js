import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugRenderer from "cannon-es-debugger";
import PointerLockControls from "../../input/PointerLockControls.js";
import GameEngine from "../../GameEngine.js";

// assets
import "../../assets/gltf/maps/flora_square.glb"
import {OBB} from "three/addons/math/OBB.js";
import {BoxGeometry, Matrix3, Matrix4} from "three";


export default class GraphicsWorld {

    constructor() {
        this.OBBs = []
        this.HITBOXES = []

        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
        })

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xccccff );
        this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

        this.cannonDebugRenderer = new CannonDebugRenderer(this.scene, this.world)

        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.z = 5;

        this.createPlayer()

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
                case 'Building':

                    /** CANNON buildings **/
                    // const boxShape = new CANNON.Box(obj.scale)
                    // const boxBody = new CANNON.Body({
                    //     type: CANNON.Body.STATIC,
                    //     shape: boxShape
                    // })
                    // console.log(boxBody)
                    // boxBody.position.copy(obj.position)
                    // boxBody.quaternion.copy(obj.quaternion)
                    // this.world.addBody(boxBody)

                    /** OBB **/
                    const obb = new OBB()
                    obb.center = obj.position
                    obb.halfSize = obj.scale
                    obb.rotation.setFromMatrix4(new Matrix4().makeRotationFromQuaternion(obj.quaternion))
                    obb.object = obj
                    this.OBBs.push(obb)

                    // // create mesh from map geometry
                    // const boxGeometry = new BoxGeometry(obj.scale.x, obj.scale.y, obj.scale.z)
                    // boxGeometry.scale(2,2,2)
                    //
                    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
                    // const mesh = new THREE.Mesh(boxGeometry, material)
                    // mesh.position.copy(obj.position)
                    // mesh.rotation.copy(obj.rotation)
                    // this.scene.add( mesh );
                    //
                    // // update mesh
                    // mesh.updateMatrix();
                    // mesh.updateMatrixWorld();
                    // mesh.geometry.computeBoundingBox()
                    // mesh.geometry.boundingBox.applyMatrix4( mesh.matrixWorld );
                    //
                    // const helper = new THREE.Box3Helper( mesh.geometry.boundingBox, 0xffff00 );
                    // this.scene.add( helper );


                    // boxGeometry.obb = new OBB();



                    break;
                case 'Floor':
                    // const groundBody = new CANNON.Body({
                    //     type: CANNON.Body.STATIC,
                    //     shape: new CANNON.Plane(),
                    // })
                    // groundBody.position.y = .5
                    // groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
                    // this.world.addBody(groundBody)
                    break;
                default:
                    break;
            }
        }
        this.engine.serverConnector.socket.emit('register_spawner', spawners)
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
            e.preventDefault();
            console.log('saved config in localStorage')
            // TODO
            console.log('bye')
        });
    }
}