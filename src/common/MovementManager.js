import * as THREE from "three";

export default class MovementManager {

    constructor(props) {
        this.host = props.host
        this.steering = new THREE.Vector3()
    }

    /**
     * Translate a vector3 to some Vector3 by host speed
     * @param v Vector3
     */
    seek(v) {
        const min = v.clone().add(this.host.position.clone().negate())
        const normalized = new THREE.Vector3(min.x, min.y, min.z).normalize()
        const velocity = normalized.clone().multiplyScalar(this.host.speed)
        this.host.position.add(velocity)
    }

    flee(v) {
        this.seek(v)
    }

    update() {

    }

}