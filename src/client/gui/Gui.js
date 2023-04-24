import * as dat from "dat.gui";

export default class Gui {

    constructor() {
        this.gui = new dat.GUI();
        this.folders = new Map()
    }

    addFolder(name) {
        const f = this.gui.addFolder(name)
        f.open()
        this.folders.set(name, f)
        // const cubeFolder =
        // cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
        // cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
        // cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
        // cubeFolder.open()
        // const cameraFolder = gui.addFolder('Camera')
        // cameraFolder.add(camera.position, 'z', 0, 10)
        // cameraFolder.open()
    }

    addToFolder(name, object, property, start, end) {
        if (this.folders.has(name)) {
            this.folders.get(name).add(object, property, start, end).listen()
        }
    }

}