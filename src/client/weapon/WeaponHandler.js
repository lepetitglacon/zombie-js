import * as THREE from "three";
import Weapon from "./Weapon.js";
import Knife from "./knife/Knife.js";

export default class WeaponHandler {

    constructor(props) {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        this.weapons = []
        this.weapon = new Weapon({raycaster: this.raycaster, weaponHandler: this})
        this.knife = new Knife({raycaster: this.raycaster, weaponHandler: this})

        this.UIBulletCount = document.getElementById('current-weapon-bullet')
        // this.UIBulletMax = document.getElementById('current-weapon-maxbullet')
        this.UIStoredBullet = document.getElementById('current-weapon-stored-bullet')

        this.UIFpsView = document.getElementById('current-weapon-fpsview')


        this.UIBulletCount.innerText = this.weapon.bulletsInMagazine
        // this.UIBulletMax.innerText = this.weapon.magazineSize
        this.UIStoredBullet.innerText = this.weapon.bulletStorage

        this.bind()
    }

    bind() {

    }

    update() {
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