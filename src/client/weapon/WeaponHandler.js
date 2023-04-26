import * as THREE from "three";
import Weapon from "./Weapon.js";

export default class WeaponHandler {

    constructor(props) {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.lastHit = new Map()

        this.weapons = []
        this.weapon = new Weapon()
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