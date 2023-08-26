import * as THREE from "three";
import Zombie from "../../mob/Zombie.js";
import Utils from "../../Utils";

export default class GameEvents {

    constructor({engine, socket}) {
        this.engine = engine
        this.socket = socket
    }

    bind() {
        // get players position (update game state)
        this.socket.on('game:wave_update', (e) => {
            Utils.dispatchEventTo('wave_update', {wave: e.wave}, this.engine.game)
        })
    }

}