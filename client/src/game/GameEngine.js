import {GameStates, LoadingStates} from "../components/game/game/Z3DGame";

import ENV from "../ENV";

import SocketHandler from "./server/SocketHandler";
import ThreeWorld from "./map/ThreeWorld";
import InputManager from "./managers/InputManager";
import SoundManager from "./managers/SoundManager";
import ModelManager from "./managers/ModelManager";
import ZombieManager from "./managers/ZombieManager";
import ControllablePlayer from "./mob/ControllablePlayer";
import PlayerManager from "./managers/PlayerManager";
// import WeaponHandler from "./weapon/WeaponHandler";

export default class GameEngine extends EventTarget {

    constructor({
        socket,
        gameId,
        setGameState,
        setLoadingState,
        setCurrentWeapon,
        setWeapons,
        setPlayers
    }) {
        super();

        // react setup
        this.setGameState = setGameState
        this.setLoadingState = setLoadingState
        this.setCurrentWeapon = setCurrentWeapon
        this.setWeapons = setWeapons
        this.setPlayers = setPlayers

        this.socketHandler = new SocketHandler({engine: this, socket, gameId})
        this.playerManager = new PlayerManager({engine: this})
        this.soundManager = new SoundManager({engine: this})
        this.modelManager = new ModelManager({engine: this})
        this.inputManager = new InputManager({engine: this})
        this.three = new ThreeWorld({engine: this})
        this.zombieManager = new ZombieManager({engine: this})
        // this.weaponManager = new WeaponHandler()
        this.controllablePlayer = new ControllablePlayer({engine: this})

        this.lastFrameTime = performance.now();

        this.bind()
    }

    /**
     * Main loop
     */
    run() {
        this.requestAnimationFrame = requestAnimationFrame(() => this.run() );
        const delta = this.getDelta_()

        // update game
        this.inputManager.update(delta)
        this.controllablePlayer.update(delta)

        this.socketHandler.update()

        // send position data to server
        this.socketHandler.socket.volatile.emit('player_state', this.controllablePlayer.position, this.controllablePlayer.lookDirection)

        this.three.update(delta) // last update view
    }

    getDelta_() {
        const time = performance.now();
        const delta = ( time - this.lastFrameTime ) / 1000
        this.lastFrameTime = performance.now()
        return delta;
    }

    setRendererElement(node) {
        this.three.setRendererElement(node)
    }

    setUiNode(node) {
        this.guiNode = node
    }

    bind() {
        this.addEventListener('loading-connected', (e) => {
            this.setLoadingState(LoadingStates.ASSETS)
        })
        this.addEventListener('loading-assets', async (e) => {
            // TODO load assets and send assets loaded to server
            console.log(e)

            // map
            for (const mapToLoad of e.map) {
                this.modelManager.registerModel('map', ENV.SERVER_HOST + 'assets/' + mapToLoad)
            }

            // models
            for (const modelToLoad of e.models) {
                this.modelManager.registerModel(modelToLoad.name, ENV.SERVER_HOST + 'assets/' + modelToLoad.path)
            }

            // wait for models loading
            await this.modelManager.download()
            this.setLoadingState(LoadingStates.INIT)

            await this.three.init()
            await this.zombieManager.init()

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
            this.socketHandler.socket.emit('get_players')
            this.run()
        })
    }

    cleanup() {
        cancelAnimationFrame(this.requestAnimationFrame)
        this.cleanup_()
        this.three.cleanup()
        this.inputManager.cleanup()
    }

    cleanup_() {
        // TODO cleanup event listeners by creating function
    }


}