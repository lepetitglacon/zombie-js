import Weapon from "../Weapon.js";

export default class Knife extends Weapon {

    constructor(props) {
        super(props);

        this.name = "Knife"

        this.basePoint = 130
        this.headshotPoint = 130

        this.fireRate = 1300
        this.damages = 100

        this.bulletsInMagazine = Infinity

        this.fireSoundName = 'weapon_knife_slash'

        this.range = 2.1
    }

    shoot() {
        super.shoot();
    }

    handleHit_(intersects) {
        for ( let i = 0; i < intersects.length; i ++ ) {

            const intersect = intersects[ i ]
            const obj = intersect.object

            if (intersect.distance < this.range && obj.isZombie) {
                this.addToAlreadyHit_(obj)
            }
        }
    }
}