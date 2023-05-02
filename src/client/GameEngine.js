// assets
import "./assets/css/style.css"
import "./assets/img/zombie-hand.png"
import "./assets/img/crosshair.png"
import "./assets/img/enter.png"
import "./assets/img/loader.gif"
import "./assets/img/loader2.gif"

import "./assets/img/weapons/pistol/fpsview.png"
import "./assets/gltf/Soldier.glb"

import "./assets/fonts/HelpMe.ttf"

import Game from "./Game.js";
import ModelManager from "./managers/ModelManager.js";
import SoundManager from "./managers/SoundManager.js";
import Loader from "./gui/Loader/Loader.js";
import ServerConnector from "./server/ServerConnector.js";
import InputManager from "./input/InputManager.js";
import Gui from "./gui/Gui.js";
import OptionMenu from "./gui/Menu/OptionMenu.js";
import ChatThread from "./gui/TextThread/ChatThread.js";

export default class GameEngine {

    static STATE = {
        MENU: 0,
        OPTION: 1,
        GAME: 2,
    }

    constructor() {
        this.state = GameEngine.STATE.GAME

        this.loader = new Loader()
        this.loader.show()

        this.inputManager = new InputManager()

        this.soundManager = new SoundManager()
        this.modelManager = new ModelManager()
        this.modelManager.registerModel('player', '../gltf/Soldier.glb')

        this.serverConnector = new ServerConnector(window.location.href.substring(window.location.href.lastIndexOf('/') + 1))

        this.gui = new Gui()
        this.menu = new OptionMenu()

        this.chat = new ChatThread()

        this.game = new Game()
    }

    bind() {
        this.infoDiv = document.getElementById("info")
        this.crosshairDiv = document.getElementById("crosshair")
        this.points = document.getElementById("points")
    }

    run() {
        this.game.init()
    }
}