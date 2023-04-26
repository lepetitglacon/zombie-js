export default class Weapon {

    constructor(props) {
        this.raycaster = props.raycaster

        this.damages = 10
        this.fireRate = 250 // ms
        this.lastFired = Date.now() // ms

        this.realoadRate = Date.now() // ms
        this.realoadStart = Date.now() // ms
        this.isReloading = false

        this.magazineSize = 15
        this.bulletsInMagazine = 15
        this.maxBulletStorage = 75
        this.bulletStorage = this.maxBulletStorage
    }

    shoot() {
        if (this.bulletsInMagazine > 0) {

            if (this.canShoot()) {

            }

        } else {
            this.reload()
        }
    }

    reload() {
        if (this.isReloading) {
            if (this.realoadStart + this.realoadRate < Date.now()) {
                const missingBullets = this.bulletsInMagazine - this.magazineSize
                if (this.bulletStorage >= missingBullets) {
                    this.bulletStorage -= missingBullets
                    this.bulletsInMagazine += missingBullets
                } else {
                    this.bulletsInMagazine += this.bulletStorage
                    this.bulletStorage = 0
                }

            }
        } else {
            this.realoadStart = Date.now()

        }
    }

    canShoot() {
        return this.lastFired + this.fireRate < Date.now()
    }

}