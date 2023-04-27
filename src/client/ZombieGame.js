// assets
import "./assets/css/style.css"
import "./assets/img/zombie-hand.png"
import "./assets/img/crosshair.png"
import "./assets/img/enter.png"
import "./assets/img/weapons/pistol/fpsview.png"
import "./assets/gltf/Soldier.glb"


import Game from "./Game.js";

export default class ZombieGame {

    static STATE = {
        MENU: 0,
        OPTION: 1,
        GAME: 2,
    }

    constructor() {
        this.state = ZombieGame.STATE.MENU
        this.game = new Game()

        this.player = {
            speed: 80,
            mass: 90,
            height: 1.8
        }

        switch (this.state) {
            case ZombieGame.STATE.MENU:

                break;
            case ZombieGame.STATE.OPTION:

                break;
            case ZombieGame.STATE.GAME:

                break;
        }

        this.bind()
    }

    bind() {
        this.chatDiv = document.getElementById("chat-div")
        this.chatUl = document.getElementById("chat-ul")
        this.chatInput = document.getElementById("chat-input")

        this.infoDiv = document.getElementById("info")

        this.optionMenu = document.getElementById("option-menu")
        this.optionMenuBtnOptions = document.getElementById("option-menu-btn-option")
        this.optionMenuBtnLeaveGame = document.getElementById("option-menu-btn-leave-game")

        this.crosshairDiv = document.getElementById("crosshair")

        //this.crosshairDiv.classList.toggle('hidden')
        //this.chatDiv.classList.toggle('hidden')
    }

    play() {
        this.game.init()
        window.dispatchEvent(new Event("ZombieGame-start"))
    }
}