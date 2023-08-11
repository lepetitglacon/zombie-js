import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {FBXLoader} from "three/addons/loaders/FBXLoader.js";
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export default class ModelManager {

    constructor() {
        this.gltfLoader = new GLTFLoader()
        this.fbxLoader = new FBXLoader()

        this.models = new Map()
        this.animations = []
        this.registeredModels = new Map()
    }

    async download() {
        for (const [name, path] of this.registeredModels) {
            const model = await this.downloadModel_(name, path)
            const ext = ModelManager.getExtFromPath(path)

            switch (ext) {
                case 'fbx':
                    if (model.animations.length > 0) {
                        this.animations.push(...model.animations)
                    }
                    this.models.set(name, model)
                    break;
                default:
                    if (model.animations.length > 0) {
                        this.animations.push(...model.animations)
                    }
                    this.models.set(name, model.scene)
                    break;
            }

            console.log('[ASSETS] Loaded model "' + name + '"', model)
        }
        console.log('[ASSETS] loaded all registered models')
    }

    /**
     * downloads the model
     * @param name
     * @param path
     */
    downloadModel_(name, path) {
        const ext = ModelManager.getExtFromPath(path)
        switch (ext) {
            case 'fbx':
                return this.fbxLoader.loadAsync(
                    path,
                    (xhr) => {

                    }
                );
            default:
                return this.gltfLoader.loadAsync(
                    path,
                    (xhr) => {

                    }
                );
        }
    }

    /**
     * register a model to be loaded
     * @param name
     * @param path
     */
    registerModel(name, path) {
        console.log('[ASSET] Registered asset : ' + name)
        this.registeredModels.set(name, path)
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
        } else {
            console.error('Model not recognized : "' + name + '"')
        }
    }

    /**
     * return a copy of the OG model
     * that you can transform
     * @param name
     * @returns {*}
     */
    getModelSkeletonCopy(name) {
        if (this.models.has(name)) {
            return SkeletonUtils.clone(this.models.get(name))
        } else {
            console.error('Model not recognized : "' + name + '"')
        }
    }

    static getExtFromPath(path) {
        return path.substring(path.lastIndexOf('.')+1, path.length)
    }

}