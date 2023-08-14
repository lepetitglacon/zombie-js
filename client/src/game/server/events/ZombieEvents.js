import * as THREE from "three";
import Zombie from "../../mob/Zombie.js";
import Utils from "../../Utils";

export default class ZombieEvents {

    constructor({engine, socket}) {
        this.engine = engine
        this.socket = socket
    }

    bind() {
        // get players position (update game state)
        this.socket.on('zombies_positions', (zombieList) => {
            Utils.dispatchEventTo('positions', {zombies: zombieList}, this.engine.zombieManager)
        })

        // on zombie death
        this.socket.on('zombie_death', (zombieDeathObject) => {

            // TODO send this event to ZombieManager

            // if (this.serverConnector.engine.game.ZOMBIES.has(zombieDeathObject.id)) {
            //     const zombie = this.serverConnector.engine.game.ZOMBIES.get(zombieDeathObject.id)
            //
            //     // spawn objects
            //     for (const object of zombieDeathObject.objects) {
            //         console.log("[OBJECT] spawned " + object)
            //
            //         const obj = this.serverConnector.engine.modelManager.getModelCopy('object-max_ammo')
            //         obj.position.copy(zombie.gltf.position)
            //         obj.position.y = 0
            //
            //         this.serverConnector.engine.game.three.scene.add(obj)
            //
            //
            //         // this.engine.game.OBJECTS.set()
            //
            //     }
            //
            //     zombie.removeFromScene()
            //     this.serverConnector.engine.game.ZOMBIES.delete(zombieDeathObject.id)
            // }
        })
    }

}