export default class AbstractTextThread {

    constructor(props) {
        this.messages = []

        this.div = document.getElementById("chat-div")
        this.ul = document.getElementById("chat-ul")
        this.input = document.getElementById("chat-input")
    }

}