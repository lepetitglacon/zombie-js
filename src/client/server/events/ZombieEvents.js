import * as THREE from "three";
import Zombie from "../../mob/Zombie.js";

export default class ZombieEvents {

    constructor(serverConnector) {
        this.serverConnector = serverConnector
    }

    init() {
        // get players position (update game state)
        this.serverConnector.socket.on('zombies_positions', (zombieList) => {
            for (const i in zombieList) {
                const z = zombieList[i]
                if (this.serverConnector.engine.game.ZOMBIES.has(z.id)) {
                    const zombie = this.serverConnector.engine.game.ZOMBIES.get(z.id)
                    zombie.mesh.position.set(z.position.x, z.position.y, z.position.z)
                    let angle = Math.atan2(z.direction.z, z.direction.x)
                    zombie.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI / 2))
                    if (zombie.gltf !== undefined) {
                        zombie.gltf.position.set(z.position.x, z.position.y - 1, z.position.z)
                        zombie.gltf.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI / 2))
                    }
                } else {
                    this.serverConnector.engine.game.ZOMBIES.set(z.id, new Zombie(z))
                }

            }
        })

        // on zombie death
        this.serverConnector.socket.on('zombie_death', (zombieDeathObject) => {
            if (this.serverConnector.engine.game.ZOMBIES.has(zombieDeathObject.id)) {
                const zombie = this.serverConnector.engine.game.ZOMBIES.get(zombieDeathObject.id)

                // spawn objects
                for (const object of zombieDeathObject.objects) {
                    console.log("[OBJECT] spawned " + object)

                    const obj = this.serverConnector.engine.modelManager.getModelCopy('object-max_ammo')
                    obj.position.copy(zombie.gltf.position)
                    obj.position.y = 0

                    this.serverConnector.engine.game.three.scene.add(obj)


                    // this.engine.game.OBJECTS.set()

                }

                zombie.removeFromScene()
                this.serverConnector.engine.game.ZOMBIES.delete(zombieDeathObject.id)
            }
        })
    }

}