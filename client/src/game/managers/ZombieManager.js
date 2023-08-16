import * as THREE from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import {BufferGeometry, InstancedMesh} from "three";
import Zombie from "../mob/Zombie";
import Utils from "../Utils";

export default class ZombieManager extends EventTarget {

    constructor({engine}) {
        super()

        this.engine = engine
        this.ZOMBIES = new Map()

        this.bind()
    }

    async init() {
        this.model = this.engine.modelManager.getModelCopy('zombie')
        console.log(this.model)

        // this.engine.three.scene.add(this.model)

        // const mergedGeometryArray = []
        // for (const bodyPart of this.model.children[0].children) {
        //     mergedGeometryArray.push(bodyPart.geometry)
        // }
        //
        // const mergedGeometry = BufferGeometryUtils.mergeGeometries(mergedGeometryArray)
        // console.log(mergedGeometry)
        //
        // const defaultTransform = new THREE.Matrix4()
        //     .makeRotationX( Math.PI )
        //     .multiply( new THREE.Matrix4().makeScale( 7, 7, 7 ) );
        //
        // mergedGeometry.applyMatrix4( defaultTransform );
        //
        // this.geometry = mergedGeometry
        // this.material = this.model.children[0].material
        // this.mesh = new InstancedMesh(this.geometry, this.material, 2)
        // this.engine.three.scene.add(this.mesh)
    }

    spawn_(zombie) {
        this.ZOMBIES.set(zombie.id, new Zombie({engine: this.engine, zombie}))
    }

    kill_(zombie) {
        if (this.ZOMBIES.has(zombie.id)) {
            this.ZOMBIES.get(zombie.id).removeFromScene()
            this.ZOMBIES.delete(zombie.id)
        }

        // spawn objects
        for (const object of zombie.droppedObjects) {
            console.log(" TODO [OBJECT] spawned " + object)
            // const obj = this.serverConnector.engine.modelManager.getModelCopy('object-max_ammo')
            // obj.position.copy(zombie.model.position)
            // obj.position.y = 0
            // this.serverConnector.engine.game.three.scene.add(obj)
            // this.engine.game.OBJECTS.set()
        }
    }

    bind() {
        this.addEventListener('spawn', e => {
            this.spawn_(e.zombie)
        })
        this.addEventListener('kill', e => {
            this.kill_(e.zombie)
        })
        this.addEventListener('positions', e => {
            for (const zombie of e.zombies) {
                if (this.ZOMBIES.has(zombie.id)) {
                    const z = this.ZOMBIES.get(zombie.id)
                    const angle = Math.atan2(zombie.direction.z, zombie.direction.x)

                    z.model.position.set(zombie.position.x, zombie.position.y, zombie.position.z)
                    z.model.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI / 2))
                } else {
                    Utils.dispatchEventTo('spawn', {zombie: zombie}, this)
                }
            }
        })
    }

}