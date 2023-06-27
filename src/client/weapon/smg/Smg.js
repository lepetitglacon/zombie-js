import Weapon from "../Weapon.js";

export default class Smg extends Weapon {

    constructor(props) {
        super(props);

        this.name = "MP40"
        this.imgSrc = "../img/weapons/smg/mp40.png"

        this.isAutomatic = true
        this.switchTime = 1500 // ms

        this.damages = 30
        this.fireRate = 138 // ms
        this.realoadRate = 2200 // ms
        this.magazineSize = 30
        this.maxBulletStorage = 100
        this.bulletsInMagazine = this.magazineSize
        this.bulletStorage = this.maxBulletStorage
    }

}