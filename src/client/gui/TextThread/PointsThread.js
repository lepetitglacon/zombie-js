import AbstractTextThread from "./AbstractTextThread.js";

export default class PointsThread extends AbstractTextThread {

    constructor() {
        super();
        this.div = document.getElementById("points")
        this.ul = document.getElementById("points-ul")

        this.pointsLi = new Map()


    }

    init() {
        this.engine = window.ZombieGame
    }

    update(playerPoints) {
        for (const i in playerPoints) {
            const playerId = playerPoints[i].player
            const playerName = playerPoints[i].playerName
            const points = playerPoints[i].points

            if (this.pointsLi.has(playerId)) {
                this.pointsLi.get(playerId).points.innerText = points
                this.pointsLi.get(playerId).username.innerText = playerName
            } else {
                const pointSpan = this.createSpan(points)
                const usernameSpan = this.createSpan(playerName)

                if (this.engine.game.PLAYERS.has(playerId)) {
                    usernameSpan.style.color = '#'+ this.engine.game.PLAYERS.get(playerId).color.toString(16)

                    if (playerId === this.engine.serverConnector.socket) {

                    }
                }

                this.pointsLi.set(playerId, {username: usernameSpan, points: pointSpan})

                const li = this.createLi()
                li.appendChild(usernameSpan)
                li.appendChild(pointSpan)

                this.ul.appendChild(li)
            }
        }
    }

    createLi() {
        return document.createElement('li')
    }

    createSpan(text) {
        const span = document.createElement('span')
        span.innerText = text
        span.classList.add('mx-2')
        return span
    }

}