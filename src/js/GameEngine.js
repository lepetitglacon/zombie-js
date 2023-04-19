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
        const mainMenu = document.getElementById("main-menu")
        const startGameButton = document.getElementById("start-game")
        const crosshairDiv = document.getElementById("crosshair")
        startGameButton.addEventListener("click", (e) => {
            if (this.game === undefined) {
                this.game = new Game()
            }
            mainMenu.remove()
            this.game.init()
            crosshairDiv.classList.toggle('hidden')
            window.dispatchEvent(new Event("ZombieGame-start"))
            startGameButton.remove()
        })


    }
}