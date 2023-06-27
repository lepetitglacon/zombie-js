// assets
import "./assets/css/style.css"
import "./assets/img/zombie-hand.png"
import "./assets/img/crosshair.png"
import "./assets/img/enter.png"
import "./assets/img/loader.gif"
import "./assets/img/loader2.gif"

import "./assets/img/map-preview/flora_square.jpg"

import "./assets/img/weapons/pistol/fpsview.png"
import "./assets/img/weapons/knife/knife.png"
import "./assets/gltf/Soldier.glb"
import "./assets/gltf/player.glb"
import "./assets/gltf/objects/max_ammo.glb"

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
import Lobby from "./server/Lobby.js";

export default class GameEngine extends EventTarget {

    static STATE = {
        MENU: 0,
        OPTION: 1,
        GAME: 2,
        CHAT: 3,
        LOBBY: 4,
    }

    constructor() {
        super();

        this.state = GameEngine.STATE.LOBBY

        this.debug = true

        this.loader = new Loader()

        this.soundManager = new SoundManager()
        this.modelManager = new ModelManager()
        this.modelManager.registerModel('soldier', '../gltf/Soldier.glb')
        this.modelManager.registerModel('player', '../gltf/player.glb')
        this.modelManager.registerModel('object-max_ammo', '../gltf/objects/max_ammo.glb')

        this.inputManager = new InputManager()
        this.serverConnector = new ServerConnector()
        this.chat = new ChatThread()

        this.lobby = new Lobby(this.loader, this.serverConnector, this.modelManager, this)
        this.game = new Game()
    }

    run() {
        this.lobby.run()
    }

    init() {
        this.lobby.hide()

        this.state = GameEngine.STATE.GAME

        // show GUI
        document.getElementById('game-UI').classList.toggle('d-none')

        this.gui = new Gui()
        this.waveGui = new WaveGui()
        this.actionGui = new ActionGui()
        this.menu = new OptionMenu()
        this.points = new PointsThread()


        this.game.init()
    }
}