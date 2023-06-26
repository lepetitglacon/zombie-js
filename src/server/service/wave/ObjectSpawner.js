export default class ObjectSpawner {

    constructor() {
        this.spawnProbability = 0.20
    }

    init() {

    }

    spawnObject() {
        const rdm = Math.random()
        console.log(rdm)
        if (this.spawnProbability > Math.random()) {
            return ['max_ammo']
        } else {
            return []
        }
    }

}