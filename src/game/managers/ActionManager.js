

export default class ActionManager extends EventTarget {

    constructor({engine}) {
        super()
        this.engine = engine

        this.message = ''
        this.action = () => {}

        this.bind()
    }

    bind() {
        this.addEventListener('execute_action', e => {
            this.action()
        })
        this.addEventListener('set_action', e => {
            this.message = e.message
            this.action = e.action
            this.dispatchEvent(new Event('UI:after_message_set'))
        })
        this.addEventListener('unset_action', e => {
            this.message = ''
            this.action = () => {}
            this.dispatchEvent(new Event('UI:after_message_set'))
        })
    }

}