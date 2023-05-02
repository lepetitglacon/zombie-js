import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

export default class ModelManager {

    constructor() {
        this.loader = new GLTFLoader()
        this.models = new Map()
        this.registeredModels = new Map()
    }

    async download() {
        for (const [name, path] of this.registeredModels) {
            const gltf = await this.downloadModel(name, path)
            this.models.set(name, gltf.scene)
            console.log('[ASSETS] loaded model ' + name)
        }
        console.log('[ASSETS] loaded')
    }

    /**
     * register a model to be loaded
     * @param name
     * @param path
     */
    registerModel(name, path) {
        this.registeredModels.set(name, path)
    }

    /**
     * downloads the model
     * @param name
     * @param path
     */
    downloadModel(name, path) {
        return this.loader.loadAsync(
            path,
            (gltf) => {

            }
            // ,
            // (xhr) => {
            //     // console.log('loading ' + name + ' at ' + ( xhr.loaded / xhr.total * 100 ) + '%')
            // }
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