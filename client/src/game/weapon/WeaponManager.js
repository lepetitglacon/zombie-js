import * as THREE from "three";
import Weapon from "./Weapon.js";
import Knife from "./knife/Knife.js";
import Pistol from "./pistol/Pistol.js";
import Smg from "./smg/Smg.js";

export default class WeaponManager extends EventTarget {

    constructor({engine}) {
        super()

        this.engine = engine

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        this.lastSwitch = Date.now()

        this.weapons = []
        this.weapon = null
        this.addWeapon(new Pistol({engine: this.engine, raycaster: this.raycaster, weaponManager: this}))
        this.addWeapon(new Smg({engine: this.engine, raycaster: this.raycaster, weaponManager: this}))
        this.knife = new Knife({engine: this.engine, raycaster: this.raycaster, weaponManager: this})

        // this.UIBulletCount = document.getElementById('current-weapon-bullet')
        // this.UIBulletMax = document.getElementById('current-weapon-maxbullet')
        // this.UIStoredBullet = document.getElementById('current-weapon-stored-bullet')

        // this.UIFpsView = document.getElementById('current-weapon-fpsview')
        // this.UIFpsViewImg = document.getElementById('current-weapon-fpsview-img')

        // this.UIBulletCount.innerText = this.weapon.bulletsInMagazine
        // this.UIBulletMax.innerText = this.weapon.magazineSize
        // this.UIStoredBullet.innerText = this.weapon.bulletStorage

        // this.weapon.updateUI()
        this.bind()
    }

    update(delta) {

        this.weapon.update(delta)

        if (this.weapon.isReloading) {
            this.weapon.reload()
        }

        if (this.engine.inputManager.isClicking && this.weapon.isAutomatic) {
            this.shoot()
        }
    }

    shoot() {
        this.weapon.shoot()
    }

    reload() {
        this.weapon.reload()
    }

    // add a weapon or trade weapon
    addWeapon(weapon) {
        this.weapons.push(weapon)
        this.weapon = weapon
    }

    bind() {
        this.addEventListener('shoot', (e) => {
            this.shoot()
        })

        this.addEventListener('reload', (e) => {
        })

        this.addEventListener('switch-weapon', (e) => {
            // if (this.lastSwitch + this.weapon.switchTime < Date.now()) {
            //     if (this.weapons.length > 1) {
            //         console.log('[WEAPON] current weapon is ' + this.weapon.name)
            //         if (this.weapon.name === this.weapons[0].name) {
            //             this.weapon = this.weapons[1]
            //         } else {
            //             this.weapon = this.weapons[0]
            //         }
            //         this.lastSwitch = Date.now()
            //         this.weapon.updateUI()
            //         console.log('[WEAPON] switched to ' + this.weapon.name)
            //     }
            // }
        })
    }
}