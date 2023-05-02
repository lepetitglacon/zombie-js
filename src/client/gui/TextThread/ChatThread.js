import AbstractTextThread from "./AbstractTextThread.js";

export default class ChatThread extends AbstractTextThread {

    constructor() {
        super();
        this.isOpen = false

        this.div = document.getElementById("chat-div")
        this.ul = document.getElementById("chat-ul")
        this.input = document.getElementById("chat-input")
    }

    init() {
        this.engine = window.ZombieGame
    }

    open() {
        this.isOpen = true
        this.input.focus({preventScroll: true})
        this.engine.game.three.controls.unlock()
    }

    close() {
        this.isOpen = false
        this.engine.game.three.controls.lock()
    }

    reset() {
        this.input.value = ''
        document.activeElement.blur()
    }

    isEmpty() {
        console.log('lenght', this.input.value.length > 0)
        return this.input.value.length <= 0
    }

    isActive() {
        return this.input === document.activeElement
    }

}