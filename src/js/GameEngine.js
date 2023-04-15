import * as CANNON from "cannon-es";
import Game from "./Game";
import InputManager from "./input/InputManager";

export default class GameEngine {

    static STATE = {
        MENU: 0,
        OPTION: 1,
        GAME: 2,
    }

    constructor() {
        this.state = GameEngine.STATE.MENU
        this.game = undefined

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
        const startGameButton = document.getElementById("start-game")
        startGameButton.addEventListener("click", (e) => {
            e.preventDefault()
            if (this.game === undefined) {
                this.game = new Game()
            }
            startGameButton.remove()
        })


    }
}