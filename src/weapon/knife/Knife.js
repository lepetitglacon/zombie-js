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
        this.div = document.getElementById('knife')

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

    // override
    updateUI() {
        this.isReloading = true

        this.div.style.transitionDuration = '.2s'
        this.div.style.transform = 'translateX(100vw)'

        this.engine.game.weaponHandler.weapon.div.style.transitionDuration = '.2s'
        this.engine.game.weaponHandler.weapon.div.style.transform = 'translateY(50vw)'

        setTimeout(() => {
            this.isReloading = false

            this.div.style.transitionDuration = '0'
            this.div.style.transform = 'translateX(-100vw)'

            this.engine.game.weaponHandler.weapon.div.style.transitionDuration = '.4s'
            this.engine.game.weaponHandler.weapon.div.style.transform = 'translateY(0)'
        }, this.fireRate - 400)
    }
}