import GameEngine from "../../GameEngine.js";

export default class OptionMenu {

    constructor() {
        this.optionMenu = document.getElementById("option-menu")

        // resume game
        this.resumeGame = document.getElementById("option-menu-btn-resume")
        this.resumeGame.addEventListener('click', (e) => {
            this.close()
        })

        this.optionMenuOptionPanel = document.getElementById("option-panel")

        this.optionMenuBtnLeaveGame = document.getElementById("option-menu-btn-leave-game")


        this.mouseAcceleration = document.getElementById("mouse-acceleration")
        this.mouseAcceleration.addEventListener('change', (e) => {
            // console.log(e)
            // if (e.target.value === 'on') {
            //     this.game.config.player.mouseAcceleration = true
            // } else {
            //     this.game.config.player.mouseAcceleration = false
            // }
            // let mouse = {
            //
            // }
            // localStorage.setItem('mouse', JSON.stringify())
        })
    }

    init() {
        this.engine = window.ZombieGame

        // options panel
        this.optionMenuBtnOptions = document.getElementById("option-menu-btn-option")
        this.optionMenuBtnOptions.addEventListener('click', (e) => {
            e.preventDefault()
            this.optionMenuOptionPanel.classList.toggle('d-none')
        })

        this.optionMenuOptionSensitivity = document.getElementById("sesitivity-input")
        this.optionMenuOptionSensitivity.value = this.engine.game.three.controls.pointerSpeed
        this.optionMenuOptionSensitivity.addEventListener('input', (e) => {
            this.engine.game.three.controls.pointerSpeed = e.target.value
        })
    }

    toggle() {
        if (this.isOpen()) {
            this.close()
        } else {
            this.open()
        }
    }

    open() {
        console.log('opening menu')
        this.engine.state = GameEngine.STATE.MENU

        if (this.engine.game.three.controls.isLocked) {
            this.engine.game.three.controls.unlock()
        }

        this.optionMenu.classList.remove('d-none')

        this.resumeGame.disabled = true
        setTimeout(() => {
            this.resumeGame.disabled = false
        }, 1100)
        console.log('GameEngine.STATE.MENU is', this.engine.state)
    }

    close() {
        console.log('closing menu')
        this.engine.game.three.controls.lock()
        this.optionMenu.classList.add('d-none')
        console.log('GameEngine.STATE.MENU is', this.engine.state)
    }

    isOpen() {
        return !this.optionMenu.classList.contains('d-none')
    }
}