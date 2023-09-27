import Weapon from "./Weapon";

export default class WeaponFactory {

    constructor({engine, weaponManager}) {
        this.engine = engine
        this.weaponManager = weaponManager

        /** @type {Map<String, Object>}*/ this.availableWeapons = new Map()
        this.buildAvailableWeapons()
    }

    createWeaponFromName(weaponName) {
        if (!this.availableWeapons.has(weaponName)) {
            throw new Error('Weapon name is not in WeaponFactory available Weapons')
        }

        const weapon = new Weapon({
            engine: this.engine,
            weaponManager: this.weaponManager
        })
        weapon.setData(this.availableWeapons.get(weaponName))
        return weapon
    }

    buildAvailableWeapons() {
        this.availableWeapons.set('M1911', {
            name: "M1911",
            type: 'Pistol',
            isAutomatic: false,
            switchTime: 500,
            damages: 24,
            fireRate: 200,
            realoadRate: 2000,
            magazineSize: 15,
            maxBulletStorage: 75,
            fireSoundName: 'weapon-pistol-fire',
            reloadSoundName: 'weapon-pistol-reload'
        })
        this.availableWeapons.set('MP40', {
            name: "MP40",
            type: 'Smg',
            isAutomatic: true,
            switchTime: 1500,
            damages: 75,
            fireRate: 138,
            realoadRate: 2200,
            magazineSize: 30,
            maxBulletStorage: 100,
            fireSoundName: 'weapon-pistol-fire',
            reloadSoundName: 'weapon-pistol-reload'
        })
        this.availableWeapons.set('M1A1', {
            name: "M4A1",
            type: 'Rifle',
            isAutomatic: false,
            switchTime: 1500,
            damages: 50,
            fireRate: 166,
            realoadRate: 2200,
            magazineSize: 10,
            maxBulletStorage: 100,
            fireSoundName: 'weapon-pistol-fire',
            reloadSoundName: 'weapon-pistol-reload'
        })
        this.availableWeapons.set('Olympia', {
            name: "Olympia",
            type: 'Shotgun',
            isAutomatic: false,
            switchTime: 1500,
            damages: 75,
            fireRate: 500,
            realoadRate: 3000,
            magazineSize: 2,
            maxBulletStorage: 50,
            fireSoundName: 'weapon-shotgun-fire',
            reloadSoundName: 'weapon-shotgun-reload'
        })
    }
}