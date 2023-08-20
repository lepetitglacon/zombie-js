import Weapon from "../Weapon.js";

export default class Pistol extends Weapon {

    constructor(props) {
        super({
            engine: props.engine,
            weaponManager: props.weaponManager,
            raycaster: props.raycaster,
        });

        this.name = "M1911"
    }

}