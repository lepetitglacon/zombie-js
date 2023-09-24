import * as THREE from "three";
import Weapon from "./Weapon.js";
import Knife from "./knife/Knife.js";
import Pistol from "./pistol/Pistol.js";
import Smg from "./smg/Smg.js";
import Utils from "../Utils";

export default class WeaponManager extends EventTarget {

    constructor({engine}) {
        super()
        this.listeners = []

        this.weaponHoldLimit = 2

        this.engine = engine

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        this.lastSwitch = Date.now()

        this.weapons = []
        this.weapon = null

        this.bind()
    }

    update(delta) {

        this.weapon.update(delta)

        if (this.weapon.isReloading) {
            this.weapon.reload()
        }

        if (this.engine.inputManager.isClicking && this.weapon.isAutomatic) {
            this.#shoot()
        }

        this.engine.three.renderer.render(this.scene, this.camera);
    }

    async init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0, 0, 0);

        this.camera = new THREE.PerspectiveCamera(
            60,
            150 / 150,
            0.1,
            2
        );

        this.engine.three.renderer.render(this.scene, this.camera);

        this.addWeapon(new Pistol({engine: this.engine, raycaster: this.raycaster, weaponManager: this}))
        this.addWeapon(new Smg({engine: this.engine, raycaster: this.raycaster, weaponManager: this}))
        this.knife = new Knife({engine: this.engine, raycaster: this.raycaster, weaponManager: this})
    }

    /**
     * add a weapon or trade weapon
     * @param weapon
     */
    addWeapon(weapon) {

        // TODO gérer les armes déjà présentes
        // TODO ou changer l'arme courante
        if (this.weapons.length >= this.weaponHoldLimit) {

        } else {
            this.weapons.push(weapon)

        }

        this.weapon = weapon
    }

    #shoot() {
        this.weapon.shoot()
    }

    #reload() {
        this.weapon.reload()
    }

    #switch() {
        if (this.lastSwitch + this.weapon.switchTime < Date.now()) {
            if (this.weapons.length > 1) {
                console.log('[WEAPON] current weapon is ' + this.weapon.name)
                if (this.weapon.name === this.weapons[0].name) {
                    this.weapon = this.weapons[1]
                } else {
                    this.weapon = this.weapons[0]
                }
                this.lastSwitch = Date.now()

                Utils.dispatchEventTo('after-switch', {}, this)

                console.log('[WEAPON] switched to ' + this.weapon.name)
            } else {
                // TODO
                // this.addWeapon()
            }
        }
    }

    bind() {
        this.addEventListener('before-shot', (e) => {
            // todo
        })
        this.addEventListener('after-shot', (e) => {
            // console.log('weapon has shot')
        })
        this.addEventListener('player-triggering-shot', (e) => {
            this.#shoot()
        })
        this.addEventListener('knife', (e) => {
            this.knife.shoot()
        })

        
        this.addEventListener('reload', (e) => {
            this.#reload()
        })
        this.addEventListener('after-reload', (e) => {
            
        })
        
        this.addEventListener('switch', (e) => {
            this.#switch()
        })
        this.addEventListener('after-switch', (e) => {
            // console.log('weapon has shot')
        })

        this.addEventListener('game:weapon:bought', (e) => {
            // TODO ajouter l'arme
            console.log('weapon has been bought from server', e)
        })
    }
}