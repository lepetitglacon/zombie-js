import * as THREE from "three";

export default class Weapon {

    // // assets
    // // https://www.videvo.net/search/?q=pistol&mode=sound-effects&sort=
    //
    // constructor(props) {
    //     this.raycaster = props.raycaster
    //     this.weaponHandler = props.weaponHandler
    //
    //     this.assetsPath = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + '/'
    //
    //     this.isAutomatic = false
    //     this.switchTime = 500 // ms
    //
    //     this.basePoint = 10
    //     this.headshotPoint = 50
    //
    //     this.name = "Weapon"
    //     this.imgSrc = "assets/img/weapons/pistol/fpsview.png"
    //
    //     this.damages = 20
    //     this.fireRate = 200 // ms
    //     this.lastFired = Date.now() // ms
    //
    //     this.realoadRate = 2000 // ms
    //     this.realoadStart = Date.now() // ms
    //     this.isReloading = false
    //
    //     this.magazineSize = 15
    //     this.bulletsInMagazine = this.magazineSize
    //     this.maxBulletStorage = 75
    //     this.bulletStorage = this.maxBulletStorage
    //
    //     this.alreadyHit = new Map()
    //
    //     this.fireSoundName = 'weapon_pistol_shot'
    //
    //     this.div = document.getElementById('current-weapon-fpsview')
    //
    //     this.engine = window.ZombieGame
    // }
    //
    // shoot() {
    //     this.weaponHandler.raycaster.set(this.engine.game.three.camera.position, this.engine.game.player.lookDirection)
    //
    //     if (!this.weaponHandler.knife.isReloading) {
    //         if (!this.isReloading) {
    //             if (this.bulletsInMagazine > 0) {
    //                 if (this.canShootByFireRate_()) {
    //
    //                     this.playFireSound_()
    //                     this.handleHit_(this.getIntersection_())
    //                     this.sendHitsToServer_()
    //                     this.prepareNextShot_()
    //                     this.handleMagazinChange_()
    //                     this.updateUI()
    //
    //                 }
    //
    //             } else {
    //                 this.reload()
    //             }
    //         }
    //     }
    //
    // }
    //
    // reload() {
    //     if (this.isReloading) {
    //         if (
    //             this.realoadStart + this.realoadRate < Date.now() &&
    //             this.bulletStorage > 0
    //         ) {
    //             window.ZombieGame.soundManager.play('weapon_pistol_reload')
    //
    //             this.weaponHandler.UIFpsView.style.opacity = 1
    //
    //             // console.log("[WEAPON] fully reloaded")
    //             const missingBullets = Math.abs(this.bulletsInMagazine - this.magazineSize)
    //             if (this.bulletStorage >= missingBullets) {
    //                 this.bulletStorage -= missingBullets
    //                 this.bulletsInMagazine += missingBullets
    //             } else {
    //                 this.bulletsInMagazine += this.bulletStorage
    //                 this.bulletStorage = 0
    //             }
    //             this.isReloading = false
    //         }
    //     } else {
    //         this.realoadStart = Date.now()
    //
    //         if (this.bulletsInMagazine !== this.magazineSize) {
    //             if (this.bulletStorage <= 0) {
    //                 window.ZombieGame.soundManager.play('weapon_pistol_reload')
    //
    //             } else {
    //                 this.isReloading = true
    //                 this.weaponHandler.UIFpsView.style.opacity = 0.5
    //             }
    //         }
    //
    //         // console.log("[WEAPON] started reload")
    //     }
    //     this.updateUI()
    // }
    //
    // // can shoot if cooldown is up
    // canShootByFireRate_() {
    //     return (this.lastFired + this.fireRate < Date.now())
    // }
    //
    // updateUI() {
    //     this.weaponHandler.UIBulletCount.innerText = this.bulletsInMagazine
    //     this.weaponHandler.UIStoredBullet.innerText = this.bulletStorage
    //
    //     console.log(this.weaponHandler.UIFpsViewImg.src)
    //     console.log(this.assetsPath)
    //     console.log(this.assetsPath + this.imgSrc)
    //     console.log(this.imgSrc)
    //
    //     if (this.weaponHandler.UIFpsViewImg.src !== this.assetsPath + this.imgSrc) {
    //         this.weaponHandler.UIFpsViewImg.src = this.imgSrc
    //     }
    //
    //     this.div.style.transitionDuration = '.1s'
    //
    //     if (this.isReloading) {
    //         this.div.style.transform = 'translateX(2vw) translateY(2vw) rotate(60deg)'
    //     }
    //     this.div.style.transform = 'translateX(2vw) translateY(2vw) rotate(5deg)'
    //
    //     setTimeout(() => {
    //         this.div.style.transitionDuration = '.05s'
    //         this.div.style.transform = 'translateX(0) translateY(0) rotate(0)'
    //     }, this.fireRate - 50)
    // }
    //
    // getIntersection_() {
    //     return this.raycaster.intersectObjects( window.ZombieGame.game.three.scene.children );
    // }
    //
    // playFireSound_() {
    //     window.ZombieGame.soundManager.play(this.fireSoundName)
    // }
    //
    // handleHit_(intersects) {
    //     for ( let i = 0; i < intersects.length; i ++ ) {
    //         const obj = intersects[ i ].object
    //         this.addToAlreadyHit_(obj)
    //     }
    // }
    //
    // addToAlreadyHit_(obj) {
    //     if (obj.isZombie) {
    //         if (!this.alreadyHit.has(obj.zombieId)) {
    //             this.currentHitObject = obj
    //             this.alreadyHit.set(obj.zombieId, {damages: this.getDamage_(), points: this.getPoints_()})
    //
    //             if (ZombieGame.game.ZOMBIES.has(this.currentHitObject.zombieId)) {
    //                 ZombieGame.game.ZOMBIES.get(this.currentHitObject.zombieId).health -= this.getDamage_()
    //             }
    //         }
    //     }
    // }
    //
    // isHeadshot() {
    //     return this.currentHitObject.name === 'Head'
    // }
    //
    // isLastHit() {
    //     return ZombieGame.game.ZOMBIES.get(this.currentHitObject.zombieId).health - this.getDamage_() <= 0;
    // }
    //
    // getPoints_() {
    //     if (this.isLastHit() && this.isHeadshot()) {
    //         return this.headshotPoint
    //     } else {
    //         return this.basePoint
    //     }
    // }
    //
    // getDamage_() {
    //     return this.damages * (this.isHeadshot() ? 2 : 1)
    // }
    //
    // sendHitsToServer_() {
    //     const hits = this.prepareHitsForServer_()
    //     this.engine.serverConnector.socket.emit('shot', {hits: hits, weapon: this.name, soundName: this.fireSoundName})
    //     this.alreadyHit.clear()
    //
    // }
    //
    // handleMagazinChange_() {
    //     this.bulletsInMagazine--
    //     if (this.bulletsInMagazine === 0) {
    //         this.reload()
    //     }
    // }
    //
    // prepareNextShot_() {
    //     this.lastFired = Date.now()
    // }
    //
    // prepareHitsForServer_() {
    //     const hits = []
    //     for (const [id, object] of this.alreadyHit) {
    //         const hit = {}
    //         hit.id = id
    //         hit.damages = object.damages
    //         hit.points = object.points
    //         hits.push(hit)
    //     }
    //     return hits
    // }


}