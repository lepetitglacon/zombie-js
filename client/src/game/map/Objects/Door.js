import {Box3} from "three";
import * as THREE from "three";

export default class Door {

    static idCounter = 0

    constructor({engine, obj}) {
        this.engine = engine
        this.three = this.engine.three

        this.id = obj.name
        this.obj = obj

        this.price = this.obj.userData.Price
        this.isOpen = false

        this.obj.geometry.computeBoundingBox()

        this.aabb = new Box3()
        this.aabb.setFromObject(obj)

        this.actionAABB = new Box3()
        this.actionAABB.set(this.aabb.min, this.aabb.max)
        this.actionAABB.expandByScalar(0.5)

        this.aabbHelper = new THREE.Box3Helper( this.aabb, 0xff0000 );
        this.three.scene.add( this.aabbHelper );

        this.actionAABBHelper = new THREE.Box3Helper( this.actionAABB, 0xff9900 );
        this.three.scene.add( this.actionAABBHelper );
    }

    buy() {
            // send to server
            this.engine.socketHandler.socket.emit('game:door:buy', {
                doorId: this.id,
            })
            console.log('send open door to server')
            this.engine.game.points -= this.price
    }

    shake() {

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
        this.three.DOORS.delete(this.id)

        // this.three.scene.remove(this.obj)
        this.obj.removeFromParent()
    }

}