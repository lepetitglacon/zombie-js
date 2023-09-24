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
import WeaponManager from "./weapon/WeaponManager";
import ActionManager from "./managers/ActionManager";
import Game from "./Game";

export default class GameEngine extends EventTarget {

    /**
     * Global states for the GameEngine
     * @type {{GAME: string, CHAT: string, MENU: string}}
     */
    static STATES = {
        GAME: 'GAME',
        MENU: 'MENU',
        CHAT: 'CHAT',
    }

    constructor({
        socket,
        gameId,
        setGameState,
        setLoadingState,
        setPlayers
    }) {
        super();

        // react setup
        this.setGameState = setGameState
        this.setLoadingState = setLoadingState
        this.setPlayers = setPlayers

        this.state = GameEngine.STATES.GAME

        this.socketHandler = new SocketHandler({engine: this, socket, gameId})
        this.three = new ThreeWorld({engine: this})
        this.game = new Game({engine: this})
        this.playerManager = new PlayerManager({engine: this})
        this.soundManager = new SoundManager({engine: this})
        this.modelManager = new ModelManager({engine: this})
        this.inputManager = new InputManager({engine: this})
        this.zombieManager = new ZombieManager({engine: this})
        this.weaponManager = new WeaponManager({engine: this})
        this.actionManager = new ActionManager({engine: this})
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
        this.weaponManager.update(delta)

        // send position data to server
        this.socketHandler.socket.volatile.emit('game:player_position', this.controllablePlayer.position, this.controllablePlayer.lookDirection)

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
        this.addEventListener('game:init:loading-connected', (e) => {
            this.setLoadingState(LoadingStates.ASSETS)
        })
        this.addEventListener('game:init:assets_to_load', async (e) => {

            // map
            for (const mapToLoad of e.map) {
                this.modelManager.registerModel('map', ENV.SERVER_HOST + 'assets/' + mapToLoad)
            }

            // models
            for (const modelToLoad of e.models) {
                this.modelManager.registerModel(modelToLoad.name, ENV.SERVER_HOST + 'assets/' + modelToLoad.path)
            }

            // TODO sounds
            for (const soundToLoad of e.sounds) {
                this.soundManager.loadSound(soundToLoad.name, 'assets/' + soundToLoad.path)
            }
            // await this.soundManager.loadSounds()

            // wait for models loading
            await this.modelManager.download()
            this.setLoadingState(LoadingStates.INIT)

            await this.three.init()
            await this.zombieManager.init()
            await this.weaponManager.init()

            this.dispatchEvent(new Event('three-loaded'))
        })
        this.addEventListener('three-loaded', (e) => {
            this.socketHandler.emitToServer('game:init:client_game_instance-loaded_assets')
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
        this.cleanup_()
        this.three.cleanup()
        this.inputManager.cleanup()
    }

    cleanup_() {
        // TODO cleanup event listeners by creating function
    }


}