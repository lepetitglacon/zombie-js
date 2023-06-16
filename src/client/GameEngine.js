// assets
import "./assets/css/style.css"
import "./assets/img/zombie-hand.png"
import "./assets/img/crosshair.png"
import "./assets/img/enter.png"
import "./assets/img/loader.gif"
import "./assets/img/loader2.gif"

import "./assets/img/weapons/pistol/fpsview.png"
import "./assets/img/weapons/knife/knife.png"
import "./assets/gltf/Soldier.glb"
import "./assets/gltf/player.glb"

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
import PointsThread from "./gui/TextThread/PointsThread.js";
import WaveGui from "./gui/Info/WaveGui.js";
import ActionGui from "./gui/Info/ActionGui.js";

export default class GameEngine /** extends EventTarget */ {

    static STATE = {
        MENU: 0,
        OPTION: 1,
        GAME: 2,
        CHAT: 3,
        LOBBY: 4,
    }

    constructor() {
        this.state = GameEngine.STATE.GAME

        this.loader = new Loader()

        this.inputManager = new InputManager()

        this.soundManager = new SoundManager()
        this.modelManager = new ModelManager()
        this.modelManager.registerModel('soldier', '../gltf/Soldier.glb')
        this.modelManager.registerModel('player', '../gltf/player.glb')

        this.serverConnector = new ServerConnector(window.location.href.substring(window.location.href.lastIndexOf('/') + 1))

        this.gui = new Gui()
        this.waveGui = new WaveGui()
        this.actionGui = new ActionGui()
        this.menu = new OptionMenu()

        this.chat = new ChatThread()
        this.points = new PointsThread()

        this.game = new Game()
    }

    bind() {
        this.infoDiv = document.getElementById("info")
        this.crosshairDiv = document.getElementById("crosshair")
        this.points = document.getElementById("points")
    }

    lobby() {
        this.loader.hide()

        this.serverConnector.prepareLobby()

        let btn = document.getElementById('lobby-start-game')
        let url = btn.dataset.url
        btn.addEventListener("click", (e) => {
            e.preventDefault()
            fetch(url)
                .then(function(response) {

                })
        })
    }

    run() {
        this.loader.show()
        this.game.init()
    }
}