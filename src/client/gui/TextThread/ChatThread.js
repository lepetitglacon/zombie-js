import AbstractTextThread from "./AbstractTextThread.js";
import GameEngine from "../../GameEngine.js";

export default class ChatThread extends AbstractTextThread {

    constructor() {
        super();
        this.isOpen = false

        this.div = document.getElementById("chat-div")
        this.ul = document.getElementById("chat-ul")
        this.input = document.getElementById("chat-input")

        this.autoClosing = setTimeout(() => {
            this.ul.style.opacity = 0
        }, 5000)
    }

    init() {
        this.engine = window.ZombieGame
    }

    open() {
        this.engine.state = GameEngine.STATE.CHAT

        this.isOpen = true
        this.ul.style.opacity = 1
        this.input.focus({preventScroll: true})
        this.engine.game.three.controls.unlock()

        clearTimeout(this.autoClosing)
    }

    close() {
        this.engine.state = GameEngine.STATE.GAME

        this.isOpen = false
        this.engine.game.three.controls.lock()

        this.autoClosing = setTimeout(() => {
            this.ul.style.opacity = 0
        }, 5000)
    }

    reset() {
        this.input.value = ''
        document.activeElement.blur()
    }

    isEmpty() {
        return this.input.value.length <= 0
    }

    isActive() {
        return this.input === document.activeElement
    }

}