

export default class Game extends EventTarget {

    constructor({engine}) {
        super()
        this.engine = engine

        this.wave = 0

        this.bind()
    }

    bind() {
        this.addEventListener('wave_update', (e) => {
            this.wave = e.wave
            this.dispatchEvent(new Event('after-wave_update'))
        })
    }
}