import * as THREE from "three";
import Utils from "../Utils.js";

export default class Weapon {

    // assets
    // https://www.videvo.net/search/?q=pistol&mode=sound-effects&sort=

    constructor({engine, weaponManager}) {
        this.engine = engine
        this.weaponManager = weaponManager
        this.raycaster = this.weaponManager.raycaster

        this.isAutomatic = false
        this.switchTime = 500 // ms

        this.basePoint = 10
        this.headshotPoint = 50

        this.name = "Weapon"
        // this.imgSrc = "assets/img/weapons/pistol/fpsview.png"

        this.damages = 20
        this.fireRate = 200 // ms
        this.lastFired = Date.now() // ms

        this.realoadRate = 2000 // ms
        this.realoadStart = Date.now() // ms
        this.isReloading = false

        this.magazineSize = 15
        this.bulletsInMagazine = this.magazineSize
        this.maxBulletStorage = 75
        this.bulletStorage = this.maxBulletStorage

        this.alreadyHit = new Map()

        this.fireSoundName = 'weapon_pistol_shot'
        this.reloadSoundName = 'weapon_pistol_shot'

        this.model = this.engine.modelManager.getModel('weapon/m1911')
        this.model.position.set()
        this.weaponManager.scene.add(this.model)

        // this.div = document.getElementById('current-weapon-fpsview')

    }

    update(delta) {
        this.model.position.copy(this.engine.three.camera.position)
        // this.model.rotation.copy(this.engine.three.camera.rotation)
        this.model.position.y -= 0.25
    }

    shoot() {
        if (this.isKnifing() || this.isReloading) return;

        if (this.hasBulletsInMagazine()) {
            if (this.canShootByFireRate_()) {
                this.raycaster.set(this.engine.three.camera.position, this.engine.controllablePlayer.lookDirection)
                this.playFireSound_()
                this.handleHit_(this.getIntersection_())
                this.sendHitsToServer_()
                this.prepareNextShot_()
                this.handleMagazinChange_()
                this.updateUI()
            }
        } else {
            this.reload()
        }


    }

    isKnifing() {
        return this.weaponManager.knife.isReloading;
    }

    hasBulletsInMagazine() {
        return this.bulletsInMagazine > 0;
    }

    reload() {
        if (!this.isReloading) {
            if (this.#isMagazineFullyLoaded()) return;

            if (this.#hasBulletLeftInStorage()) {
                this.realoadStart = Date.now()
                this.isReloading = true
                this.engine.soundManager.play(this.reloadSoundName)

            } else {
                // this.engine.soundManager.play('weapon_pistol_reload_fail')
            }

        } else {
            if (this.canReloadByTime() && this.#hasBulletLeftInStorage()) {
                this.transferBulletsFromStorageToMagazine();
                this.isReloading = false
                this.weaponManager.dispatchEvent(new Event('after-reload'))
            }
        }
    }

    canReloadByTime() {
        return this.realoadStart + this.realoadRate < Date.now();
    }

    transferBulletsFromStorageToMagazine() {
        const missingBullets = Math.abs(this.bulletsInMagazine - this.magazineSize)
        if (this.bulletStorage >= missingBullets) {
            this.bulletStorage -= missingBullets
            this.bulletsInMagazine += missingBullets
        } else {
            this.bulletsInMagazine += this.bulletStorage
            this.bulletStorage = 0
        }
    }

    #hasBulletLeftInStorage() {
        return this.bulletStorage > 0;
    }

    #isMagazineFullyLoaded() {
        return this.bulletsInMagazine === this.magazineSize;
    }

// can shoot if cooldown is up
    canShootByFireRate_() {
        return (this.lastFired + this.fireRate < Date.now())
    }

    updateUI() {
        Utils.dispatchEventTo('after-shot', {}, this.weaponManager)
    }

    getIntersection_() {
        return this.raycaster.intersectObjects( this.engine.three.scene.children );
    }

    playFireSound_() {
        this.engine.soundManager.play(this.fireSoundName)
    }

    handleHit_(intersects) {
        for ( let i = 0; i < intersects.length; i ++ ) {
            const obj = intersects[ i ].object
            this.addToAlreadyHit_(obj)
        }
    }

    addToAlreadyHit_(obj) {
        if (obj.isZombie) {
            if (!this.alreadyHit.has(obj.zombieId)) {
                this.currentHitObject = obj
                this.alreadyHit.set(obj.zombieId, {damages: this.getDamage_(), points: this.getPoints_()})

                if (this.engine.zombieManager.ZOMBIES.has(this.currentHitObject.zombieId)) {
                    this.engine.zombieManager.ZOMBIES.get(this.currentHitObject.zombieId).health -= this.getDamage_()
                }
            }
        }
    }

    isHeadshot() {
        return this.currentHitObject.name === 'Head'
    }

    isLastHit() {
        return this.engine.zombieManager.ZOMBIES.get(this.currentHitObject.zombieId).health - this.getDamage_() <= 0;
    }

    getPoints_() {
        if (this.isLastHit() && this.isHeadshot()) {
            return this.headshotPoint
        } else {
            return this.basePoint
        }
    }

    getDamage_() {
        return this.damages * (this.isHeadshot() ? 2 : 1)
    }

    sendHitsToServer_() {
        const hits = this.prepareHitsForServer_()
        this.engine.socketHandler.socket.emit('game:shot', {hits: hits, weapon: this.name, soundName: this.fireSoundName})
        this.alreadyHit.clear()
    }

    handleMagazinChange_() {
        this.bulletsInMagazine--
        if (this.bulletsInMagazine === 0) {
            this.reload()
        }
    }

    prepareNextShot_() {
        this.lastFired = Date.now()
    }

    prepareHitsForServer_() {
        const hits = []
        for (const [id, object] of this.alreadyHit) {
            const hit = {}
            hit.id = id
            hit.damages = object.damages
            hit.points = object.points
            hits.push(hit)
        }
        return hits
    }

    setData(data) {
        Object.assign(this, data)
        this.bulletsInMagazine = this.magazineSize
        this.bulletStorage = this.maxBulletStorage
        console.log(this)
    }

}