import ZombieFactory from "../mob/ZombieFactory.js";
import ObjectSpawner from "./ObjectSpawner.js";

export default class WaveHandler extends EventTarget{

    constructor({game}) {
        super()
        this.game = game

        this.ZOMBIES = new Map()

        this.objectSpawner = new ObjectSpawner()

        this.wave = 0

        this.killedZombies = 0
        this.spawnedZombies = 0
        this.maxZombiesAlive = 20

        this.zombieSpawnRate = 5000
        this.zombieSpawnRateTime = Date.now();

        this.pauseBetweenWaveTime = 10000; // 10000
        this.pauseBetweenWaveStartTime = Date.now();

        this.bind()
    }

    update(delta) {
        // update Zombie life
        for (const [id, zombie] of this.ZOMBIES) {
            if (zombie.health <= 0) {
                this.killZombie(id)
            }

            zombie.movementManager.update(delta)
        }

        if (this.shouldUpdateWave()) {
            this.updateWave()
        }

        if (this.isPausedBetweenWave()) {

        } else {
            if (this.shouldSpawnZombie()) {
                this.spawnZombie()
            }
        }

        // emit zombies position to other players
        if (this.ZOMBIES.size > 0) {
            this.game.io.to(this.game.gameId).emit('zombies_positions', this.prepareZombiesToEmit_())
        }

    }

    shouldUpdateWave() {
        return this.killedZombies >= this.getHowManyZombiesShoudlSpawnThisWave_() || this.wave === 0
    }

    updateWave() {
        this.wave++

        this.killedZombies = 0
        this.spawnedZombies = 0

        this.pauseBetweenWaveStartTime = Date.now()

        this.game.io.to(this.game.gameId).emit('game:wave_update', {wave: this.wave})
        console.debug('[WAVEHANDLER] wave ' + this.wave)
    }

    isPausedBetweenWave() {
        return this.pauseBetweenWaveStartTime + this.pauseBetweenWaveTime > Date.now()
    }

    getRandomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    shouldSpawnZombie() {
        return this.zombieSpawnRateTime + this.zombieSpawnRate < Date.now() &&
            this.ZOMBIES.size < this.maxZombiesAlive &&
            this.spawnedZombies < this.getHowManyZombiesShoudlSpawnThisWave_()
    }

    spawnZombie() {
        this.ZOMBIES.set(ZombieFactory.id, ZombieFactory.createServerZombie({game: this.game}))
        console.debug('[WAVEHANDLER] spawned zombie ' + this.spawnedZombies)

        this.spawnedZombies++

        this.zombieSpawnRate = this.getRandomNumberBetween(500, 5000)
        this.zombieSpawnRateTime = Date.now()

    }

    killZombie(id) {
        this.game.io.to(this.game.gameId).emit('game:zombie_death', {
            id: id,
            objects: this.objectSpawner.spawnObject()
        })
        this.ZOMBIES.delete(id)
        this.killedZombies++
    }

    getHowManyZombiesShoudlSpawnThisWave_() {
        return this.wave * this.game.PLAYERS.size * this.getZombiesPerWavePerPlayer_()
    }

    getZombiesPerWavePerPlayer_() {
        return this.wave < 5 ? 4 : 8
    }

    prepareZombiesToEmit_() {
        const zombies = []
        for (const [id, z] of this.ZOMBIES) {
            const zombieToSend = {}
            zombieToSend.id = z.id
            zombieToSend.position = z.position
            zombieToSend.direction = z.direction
            zombies.push(zombieToSend)
        }
        return zombies
    }

    bind() {
        this.addEventListener('shot', (e) => {
            const shot = e.shot
            for (let i in shot.hits) {
                const zombieId = shot.hits[i].id

                if (this.ZOMBIES.has(zombieId)) {
                    this.ZOMBIES.get(zombieId).health -= shot.hits[i].damages
                    const points = shot.hits[i].points
                }
            }
        })
    }
}