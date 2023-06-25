export default class ObjectSpawner {

    constructor() {
        this.spawnProbability = 0.1
    }

    init() {

    }

    spawnObject() {
        if (this.spawnProbability > Math.random()) {
            return ['max_ammo']
        } else {
            return []
        }
    }

}