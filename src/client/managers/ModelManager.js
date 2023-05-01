import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

export default class ModelManager {

    constructor() {
        this.loader = new GLTFLoader()
        this.models = new Map()

        this.loadModel('player', '../gltf/Soldier.glb')


        console.log('[ASSETS] 3D assets loaded')
    }

    loadModel(name, path) {
        this.loader.load(
            path,
            (gltf) => {
                this.models.set(name, gltf.scene)
                window.dispatchEvent(new Event('assets_loaded'))
            },
            (xhr) => {
                console.log('loading ' + name + ' at ' + ( xhr.loaded / xhr.total * 100 ) + '%')
            }
        );
    }

    /**
     * return the OG model
     * @param name
     * @returns {any}
     */
    getModel(name) {
        if (this.models.has(name)) {
            return this.models.get(name)
        }
    }

    /**
     * return a copy of the OG model
     * that you can transform
     * @param name
     * @returns {*}
     */
    getModelCopy(name) {
        if (this.models.has(name)) {
            return this.models.get(name).clone()
        }
    }

}