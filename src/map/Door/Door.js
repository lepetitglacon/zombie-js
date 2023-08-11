import {Box3} from "three";
import * as THREE from "three";
import {VertexNormalsHelper} from "three/addons/helpers/VertexNormalsHelper.js";

export default class Door {
    constructor(obj) {
        this.engine = window.ZombieGame
        this.three = window.ZombieGame.game.three

        this.price = 750

        this.obj = obj
        this.obj.geometry.computeBoundingBox()

        this.aabb = new Box3()
        this.aabb.setFromObject(obj)

        this.actionAABB = new Box3()
        this.actionAABB.set(this.aabb.min, this.aabb.max)
        this.actionAABB.expandByScalar(1.2)

        this.aabbHelper = new THREE.Box3Helper( this.aabb, 0xff0000 );
        this.three.scene.add( this.aabbHelper );

        this.actionAABBHelper = new THREE.Box3Helper( this.actionAABB, 0xff9900 );
        this.three.scene.add( this.actionAABBHelper );

        this.normalHelper = new VertexNormalsHelper( obj, 1, 0xffffff );
        this.three.scene.add( this.normalHelper );

        this.isOpen = false
    }

    init() {

    }

    buy() {
        // frontend verification is not useful for now
        // if (
        //     this.engine.game.points >= this.price &&
        //     !this.isOpen
        // ) {

            // send to server
            this.engine.serverConnector.socket.emit('door_buy', {
                doorId: this.obj.name
            })

            console.log('send open door to server')

            this.engine.game.points -= this.price

        // }
    }

    /**
     * remove all objects of that door
     * @private
     */
    remove_() {

        this.three.scene.remove(this.aabbHelper)
        this.three.scene.remove(this.actionAABBHelper)
        this.three.scene.remove(this.normalHelper)

        this.three.WALLS.delete(this.obj.name)
        this.three.DOORS.delete(this.obj.name)

        window.ZombieGame.game.three.gltf.remove(this.obj)
    }

}