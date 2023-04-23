import Game from "./Game.js";

export default class Room {

    constructor(id, io) {
        this.id = id
        this.io = io

        this.game = new Game()
        this.bind()
    }

    addPlayer() {

    }

    removePlayer() {

    }

    bind() {
        this.io
    }
}