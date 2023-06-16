import ZombieFactory from "../../../common/factory/ZombieFactory.js";

export default class WaveHandler {

    constructor(props) {
        this.game = props.game

        this.wave = 0

        this.killedZombies = 0
        this.spawnedZombies = 0
        this.maxZombiesAlive = 20

        this.zombieSpawnRate = 5000
        this.zombieSpawnRateTime = Date.now();

        this.pauseBetweenWaveTime = 10000;
        this.pauseBetweenWaveStartTime = Date.now();

        this.waveConfig = {
            0: 0,
            1: 10,
            2: 20,
            3: 30
        }

    }

    update() {

        if (this.shouldUpdateWave()) {
            this.updateWave()
        }

        if (this.isPausedBetweenWave()) {

        } else {
            if (this.shouldSpawnZombie()) {
                this.spawnZombie()
            }
        }

    }

    shouldUpdateWave() {
        return this.killedZombies >= this.waveConfig[this.wave] || this.wave === 0
    }

    updateWave() {
        this.wave++

        this.killedZombies = 0
        this.spawnedZombies = 0

        this.pauseBetweenWaveStartTime = Date.now()

        this.game.io.to(this.game.roomId).emit('wave_update', {wave: this.wave})
        console.debug('wave update')
    }

    isPausedBetweenWave() {
        return this.pauseBetweenWaveStartTime + this.pauseBetweenWaveTime > Date.now()
    }

    getRandomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    shouldSpawnZombie() {
        return this.zombieSpawnRateTime + this.zombieSpawnRate < Date.now() &&
            this.game.ZOMBIES.size < this.maxZombiesAlive &&
            this.spawnedZombies < this.waveConfig[this.wave]
    }

    spawnZombie() {
        this.game.ZOMBIES.set(ZombieFactory.id, ZombieFactory.createServerZombie(this.game.roomId))

        this.spawnedZombies++

        this.zombieSpawnRate = this.getRandomNumberBetween(500, 5000)
        this.zombieSpawnRateTime = Date.now()
    }
}