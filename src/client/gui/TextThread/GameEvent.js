import AbstractTextThread from "./AbstractTextThread.js";

export default class GameEventThread extends AbstractTextThread {

    constructor() {
        super();
        this.chatDiv = document.getElementById("chat-div")
        this.chatUl = document.getElementById("chat-ul")
        this.chatInput = document.getElementById("chat-input")
    }

    init() {

    }

}