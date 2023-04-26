import * as THREE from "three";
import Weapon from "./Weapon.js";

export default class WeaponHandler {

    constructor(props) {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.lastHit = new Map()

        this.weapons = []
        this.weapon = new Weapon({raycaster: this.raycaster, weaponHandler: this})

        this.UIBulletCount = document.getElementById('current-weapon-bullet')
        // this.UIBulletMax = document.getElementById('current-weapon-maxbullet')
        this.UIStoredBullet = document.getElementById('current-weapon-stored-bullet')


        this.UIBulletCount.innerText = this.weapon.bulletsInMagazine
        // this.UIBulletMax.innerText = this.weapon.magazineSize
        this.UIStoredBullet.innerText = this.weapon.bulletStorage

        this.bind()
    }

    bind() {
        window.addEventListener( 'click', () => {
            this.raycaster.setFromCamera( this.pointer, ZombieGame.game.three.camera );
            this.shoot()
        });
    }

    update() {
        if (this.lastHit.size > 0) {
            for (const [obj, hit] of this.lastHit) {
                if (Date.now() - hit.time > 60) {
                    obj.material.color.set(parseInt(`0x${hit.color}`))
                    this.lastHit.delete(obj)
                }
            }
        }

        if (this.weapon.isReloading) {
            this.weapon.reload()
        }
    }

    shoot() {
        this.weapon.shoot()
    }

    reload() {
        this.weapon.reload()
    }

    // add a weapon or trade weapon
    addWeapon() {

    }

    // select other weapon
    switchWeapon() {

    }
}