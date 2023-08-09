import * as dat from "dat.gui";
import Stats from 'stats.js'

export default class Gui {

    constructor() {
        this.gui = new dat.GUI();
        this.folders = new Map()

        this.stats = new Stats()
        this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)

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

    statsStart() {
        this.stats.begin()
    }

    statsEnd() {
        this.stats.end()
    }

}