export default class Utils {

    static randomColor() {
        let color = "0x" + Math.floor(Math.random()*16777215).toString(16);
        return parseInt(color)
    }

    static getRandomInt(min, max) {
        return Math.random() * (max - min) + min;
    }

    static addMessageToChat(msg, from) {
        const msgLi = document.createElement('li')
        const nameSpan = document.createElement('span')
        let username = ""
        if (window.ZombieGame.game.PLAYERS.has(from)) {
            username = window.ZombieGame.game.PLAYERS.get(from).username
        }
        username += ` (${from})`
        nameSpan.innerText = username

        if (from === window.ZombieGame.game.serverConnector.socket.id) {
            // nameSpan.style.color = '#' + window.ZombieGame.game.serverConnector.color.toString(16)
        } else {
            nameSpan.style.color = '#' + window.ZombieGame.game.PLAYERS.get(from).color.toString(16)

        }
        msgLi.innerText = ' : ' + msg
        msgLi.prepend(nameSpan)
        window.ZombieGame.chatUl.appendChild(msgLi)
    }

}