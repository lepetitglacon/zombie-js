import chalk from 'chalk'

export default class Logger {

    static options = {
        debug: true,
        info: true,
        error: true,
        game: true,
        socket: true,
        server: true,
    }

    static colors = {
        debug: 'black',
        info: 'blue',
        error: 'red',
        game: 'blueBright',
        socket: 'cyanBright',
        server: 'magentaBright',
        auth: '#DEADED'
    };

    static async init() {
        this.registerLogFunction('log', '#FFFFFF')
        this.registerLogFunction('game', '#1757af')
        this.registerLogFunction('server', '#c66bd5')
        this.log_('log', 'Logger initialized')
    }

    static registerLogFunction(name, hexColor, activated = true) {
        this.options[name] = activated
        this.colors[name] = hexColor
        this[name] = (message, subtype) => {
            this.log_(name, message, subtype);
        }
    }

    static log_(type, message = '', subtype = '') {
        const shouldLog = this.options[type];
        if (!shouldLog) return;

        const string = `[${type.toUpperCase()}]${subtype && `[${subtype.toUpperCase()}]`} ${message}`
        const coloredString = chalk.hex(this.colors[type])(string);
    }
}