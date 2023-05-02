export default class Loader {

    constructor(props) {
        this.dom = document.getElementById("loader-gif")
    }

    hide() {
        this.dom.classList.add('d-none')
    }

    show() {
        this.dom.classList.remove('d-none')
    }

    toggle() {
        this.dom.classList.toggle('d-none')
    }

}