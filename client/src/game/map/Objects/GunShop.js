import {Box3} from "three";
import * as THREE from "three";

export default class GunShop {

    static idCounter = 0

    constructor({engine, obj}) {
        this.engine = engine
        this.three = this.engine.three

        this.id = obj.name
        this.weaponName = obj.userData.weaponName
        this.price = obj.userData.Price
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
    }

    buy() {
            // send to server
            this.engine.socketHandler.socket.emit('game:gun:buy', {
                gunShopId: this.id,
                weaponName: this.weaponName,
            })
            console.log(`send buy weapon ${this.weaponName} to server`)
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

        this.three.WALLS.delete(this.obj.name)
        this.three.DOORS.delete(this.id)

        // this.three.scene.remove(this.obj)
        this.obj.removeFromParent()
    }

}