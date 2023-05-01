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

export default class ZombieGame {

    static STATE = {
        MENU: 0,
        OPTION: 1,
        GAME: 2,
    }

    constructor() {
        this.state = ZombieGame.STATE.GAME
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
        this.loader = document.getElementById("loader-gif")

        this.mouseAcceleration = document.getElementById("mouse-acceleration")
        this.mouseAcceleration.addEventListener('change', (e) => {
            // console.log(e)
            if (e.target.value === 'on') {
                this.game.config.player.mouseAcceleration = true
            } else {
                this.game.config.player.mouseAcceleration = false
            }
            let mouse = {

            }
            localStorage.setItem('mouse', JSON.stringify())
        })

        this.chatDiv = document.getElementById("chat-div")
        this.chatUl = document.getElementById("chat-ul")
        this.chatInput = document.getElementById("chat-input")

        this.infoDiv = document.getElementById("info")

        this.optionMenu = document.getElementById("option-menu")

        // resume game btn
        this.optionMenuBtnResume = document.getElementById("option-menu-btn-resume")
        this.optionMenuBtnResume.addEventListener('click', () => {
            this.state = ZombieGame.STATE.GAME
        })

        this.optionMenuOptionPanel = document.getElementById("option-panel")

        // options panel
        this.optionMenuBtnOptions = document.getElementById("option-menu-btn-option")
        this.optionMenuBtnOptions.addEventListener('click', (e) => {
            e.preventDefault()
            this.optionMenuOptionPanel.classList.toggle('d-none')
        })

        this.optionMenuOptionSensitivity = document.getElementById("sesitivity-input")
        this.optionMenuOptionSensitivity.value = this.game.three.controls.pointerSpeed
        this.optionMenuOptionSensitivity.addEventListener('input', (e) => {
            this.game.three.controls.pointerSpeed = e.target.value
        })

        // leave game btn
        this.optionMenuBtnLeaveGame = document.getElementById("option-menu-btn-leave-game")



        this.crosshairDiv = document.getElementById("crosshair")


        this.points = document.getElementById("points")


    }

    play() {
        this.game.init()
        window.dispatchEvent(new Event("ZombieGame-start"))
    }
}