import * as THREE from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import {BufferGeometry, InstancedMesh} from "three";
import Zombie from "../mob/Zombie";
import Utils from "../Utils";
import Player from "../mob/Player";

export default class PlayerManager extends EventTarget {

    constructor({engine}) {
        super()

        this.engine = engine
        this.setPlayersForUi = this.engine.setPlayers
        this.PLAYERS = new Map()

        this.bind()
    }

    async init() {
        this.model = this.engine.modelManager.getModelCopy('player')
        console.log(this.model)
    }

    connect_(player) {
        this.PLAYERS.set(player.id, new Player({engine: this.engine, player}))
    }

    disconnect_(player) {
        if (this.PLAYERS.has(player.id)) {
            this.PLAYERS.get(player.id).removeFromScene()
            this.PLAYERS.delete(player.id)
        }
    }

    bind() {
        this.addEventListener('connect', e => {
            this.connect_(e.player)
        })
        this.addEventListener('disconnect', e => {
            this.disconnect_(e.player)
        })
        this.addEventListener('positions', e => {
            for (const player of e.players) {
                if (this.PLAYERS.has(player.id)) {
                    const p = this.PLAYERS.get(player.id)
                    const angle = Math.atan2(player.direction.z, player.direction.x)

                    p.model.position.set(player.position.x, player.position.y, player.position.z)
                    p.model.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle - -(Math.PI / 2))
                } else {
                    Utils.dispatchEventTo('connect', {player: player}, this)
                }
            }
            this.setPlayersForUi()
        })
    }

}