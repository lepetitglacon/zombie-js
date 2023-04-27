import * as THREE from "three";

export default class Weapon {

    // assets
    // https://www.videvo.net/search/?q=pistol&mode=sound-effects&sort=

    constructor(props) {
        this.raycaster = props.raycaster
        this.weaponHandler = props.weaponHandler

        this.damages = 20
        this.fireRate = 0 // ms
        this.lastFired = Date.now() // ms

        this.realoadRate = 2000 // ms
        this.realoadStart = Date.now() // ms
        this.isReloading = false

        this.magazineSize = 15
        this.bulletsInMagazine = this.magazineSize
        this.maxBulletStorage = 75
        this.bulletStorage = this.maxBulletStorage

        this.alreadyHit = new Set()

        this.listener = new THREE.AudioListener();
        this.soundGunshot = new THREE.Audio( this.listener );
        this.soundReload = new THREE.Audio( this.listener );


    }

    shoot() {

        if (this.soundGunshot.buffer == null) {
            window.ZombieGame.game.three.camera.add( this.listener );
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load( 'src/client/assets/sound/gunshot.wav', ( buffer ) => {
                this.soundGunshot.setBuffer( buffer );
                this.soundGunshot.setLoop( false );
                this.soundGunshot.setVolume( 0.5 );
            });
        }

        // enough bullet or reload
        if (this.bulletsInMagazine > 0) {
            if (this.canShootByFireRate()) {
                // console.log("[WEAPON] fired")
                this.soundGunshot.play();
                this.soundGunshot.onEnded();

                const intersects = this.raycaster.intersectObjects( ZombieGame.game.three.scene.children );
                for ( let i = 0; i < intersects.length; i ++ ) {
                    const obj = intersects[ i ].object
                    if (obj.isZombie) {
                        if (this.alreadyHit.has(obj.zombieId)) {
                            continue
                        } else {
                            this.alreadyHit.add(obj.zombieId)
                            if (ZombieGame.game.ZOMBIES.has(obj.zombieId)) {
                                ZombieGame.game.ZOMBIES.get(obj.zombieId).health -= this.damages
                                // console.log('zombie' + obj.zombieId + " has " + ZombieGame.game.ZOMBIES.get(obj.zombieId).health + ' hp')
                            }
                        }
                    }
                }

                // reset hit array
                this.alreadyHit.clear()

                this.bulletsInMagazine--
                this.lastFired = Date.now()
                this.updateUI()


                if (this.bulletsInMagazine === 0) {
                    this.reload()
                }
            }

        } else {
            // console.log("[WEAPON] reloading")
            this.reload()
        }
    }

    reload() {
        if (this.isReloading) {
            if (this.realoadStart + this.realoadRate < Date.now()) {
                // console.log("[WEAPON] fully reloaded")
                const missingBullets = Math.abs(this.bulletsInMagazine - this.magazineSize)
                if (this.bulletStorage >= missingBullets) {
                    this.bulletStorage -= missingBullets
                    this.bulletsInMagazine += missingBullets
                } else {
                    this.bulletsInMagazine += this.bulletStorage
                    this.bulletStorage = 0
                }
                this.isReloading = false
            }
        } else {
            this.realoadStart = Date.now()
            this.isReloading = true

            // console.log("[WEAPON] started reload")
        }
        this.updateUI()
    }

    // can shoot if cooldown is up
    canShootByFireRate() {
        return (this.lastFired + this.fireRate < Date.now())
    }

    updateUI() {
        this.weaponHandler.UIBulletCount.innerText = this.bulletsInMagazine
        // this.weaponHandler.UIBulletMax.innerText = this.magazineSize
        this.weaponHandler.UIStoredBullet.innerText = this.bulletStorage
    }

}