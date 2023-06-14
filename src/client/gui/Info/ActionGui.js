export default class ActionGui {

    constructor() {
        this.div = document.getElementById('action-gui')
        this.message = document.getElementById('action-gui-message')

        this.door = null
    }

    init() {

    }

    hasMessage() {
        return this.message.innerText !== ""
    }

    setDoor(door) {
        this.door = door
    }

    setMessage(message) {
        this.message.style.opacity = 1
        this.message.innerText = message
    }

    hide() {
        this.message.style.opacity = 0
        this.message.innerText = ""
        this.door = null
    }

}