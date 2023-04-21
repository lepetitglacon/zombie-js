import Game from "./Game.js";

export default class GameEngine {

    static STATE = {
        MENU: 0,
        OPTION: 1,
        GAME: 2,
    }

    constructor() {
        this.state = GameEngine.STATE.MENU
        this.game = new Game()

        this.player = {
            speed: 80,
            mass: 90,
            height: 1.8
        }


        switch (this.state) {
            case GameEngine.STATE.MENU:

                break;
            case GameEngine.STATE.OPTION:

                break;
            case GameEngine.STATE.GAME:

                break;
        }

        this.bind()
    }

    bind() {
        this.chatDiv = document.getElementById("chat-div")
        this.chatUl = document.getElementById("chat-ul")
        this.chatInput = document.getElementById("chat-input")

        this.optionMenu = document.getElementById("option-menu")
        this.optionMenuBtnOptions = document.getElementById("option-menu-btn-option")
        this.optionMenuBtnLeaveGame = document.getElementById("option-menu-btn-leave-game")

        const mainMenu = document.getElementById("main-menu")
        const startGameButton = document.getElementById("start-game")
        this.crosshairDiv = document.getElementById("crosshair")

        // start game
        startGameButton.addEventListener("click", (e) => {
            if (this.game === undefined) {
                this.game = new Game()
            }
            mainMenu.classList.toggle('displaynone')
            startGameButton.classList.toggle('displaynone')

            this.crosshairDiv.classList.toggle('hidden')
            this.chatDiv.classList.toggle('hidden')

            this.game.init()
            window.dispatchEvent(new Event("ZombieGame-start"))
        })


    }
}