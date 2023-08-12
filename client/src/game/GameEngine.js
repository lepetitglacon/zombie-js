import {GameStates, LoadingStates} from "../components/game/game/Z3DGame";

import SocketHandler from "./server/SocketHandler";
import ThreeWorld from "./map/ThreeWorld";
import InputManager from "./input/InputManager";
import SoundManager from "./managers/SoundManager";
import ModelManager from "./managers/ModelManager";
import ENV from "../ENV";
// import WeaponHandler from "./weapon/WeaponHandler";

export default class GameEngine extends EventTarget {

    constructor({socket, gameId, setGameState, setLoadingState}) {
        super();
        this.setGameState = setGameState
        this.setLoadingState = setLoadingState

        this.socketHandler = new SocketHandler({engine: this, socket, gameId})

        this.soundManager = new SoundManager({engine: this})
        this.modelManager = new ModelManager({engine: this})

        this.inputManager = new InputManager({engine: this})

        this.three = new ThreeWorld({engine: this})

        // this.weaponManager = new WeaponHandler()

        this.bind()
    }

    run(t = 0) {
        this.requestAnimationFrame = requestAnimationFrame(() => this.run() );

        this.inputManager.update()
        this.three.update()
    }

    setRendererElement(node) {
        this.three.setRendererElement(node)
    }

    bind() {
        this.addEventListener('loading-connected', (e) => {
            this.setLoadingState(LoadingStates.ASSETS)
        })
        this.addEventListener('loading-assets', async (e) => {
            // TODO load assets and send assets loaded to server
            console.log(e)

            for (const mapToLoad of e.map) {
                this.modelManager.registerModel('map', ENV.SERVER_HOST + 'assets/' + mapToLoad)
            }

            await this.modelManager.download()
            this.setLoadingState(LoadingStates.INIT)

            await this.three.init()

            this.dispatchEvent(new Event('three-loaded'))
        })
        this.addEventListener('three-loaded', (e) => {
            this.socketHandler.emitToServer('client-game-loaded')
        })
        this.addEventListener('game-start', () => {
            console.log('----------------')
            console.log('GAME START')
            console.log('----------------')
            this.setGameState(GameStates.GAME)
            this.run()
        })
    }

    cleanup() {
        cancelAnimationFrame(this.requestAnimationFrame)
        this.three.cleanup()
        this.inputManager.cleanup()
    }
}