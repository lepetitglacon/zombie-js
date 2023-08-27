import GameEngine from "../GameEngine.js";
import Utils from "../Utils";

export default class InputManager {

    static MouseButtons = {
        LEFT: 0,
        WHEEL: 1,
        RIGHT: 2,
        BACK: 3,
        FORWARD: 4,
    }

    constructor({engine}) {
        this.engine = engine

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.isRunning = false

        this.isClicking = false

        this.isChatOpen = false;

        this.lastEscapeOrTab = Date.now();
        this.lastEscapeOrTabRate = 100;

        this.bind()
    }

    update() {
        // TODO update inputs
    }

    bind() {
        this.onClick_ = this.onClick.bind(this)
        this.onKeyUp_ = this.onKeyUp.bind(this)
        this.onKeyDown_ = this.onKeyDown.bind(this)
        this.onMouseUp_ = this.onMouseUp.bind(this)
        this.onMouseDown_ = this.onMouseDown.bind(this)
        this.onMouseWheel_ = this.onMouseWheel.bind(this)


        document.addEventListener('click', this.onClick_)
        document.addEventListener( 'keyup', this.onKeyUp_)
        document.addEventListener( 'keydown', this.onKeyDown_);
        document.addEventListener('mouseup', this.onMouseUp_)
        document.addEventListener('mousedown', this.onMouseDown_)
        document.addEventListener('wheel', this.onMouseWheel_)
    }

    cleanup() {
        document.removeEventListener('click', this.onClick_)
        document.removeEventListener( 'keyup', this.onKeyUp_)
        document.removeEventListener( 'keydown', this.onKeyDown_);
        document.removeEventListener('mouseup', this.onMouseUp_)
        document.removeEventListener('mousedown', this.onMouseDown_)
        document.removeEventListener('wheel', this.onMouseWheel_)
    }

    onKeyDown(e) {
        switch ( e.code ) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (e.altKey) {
                    e.preventDefault()
                }
                this.moveRight = true;
                break;

            case 'KeyR':
                this.engine.weaponManager.dispatchEvent(new Event('reload'))
                break;
            //
            // case 'KeyX':
            //     // toggle debug objects
            //     this.engine.debug = !this.engine.debug
            //     this.engine.game.three.scene.traverse((e) => {
            //         switch (e.constructor.name) {
            //             case 'Box3Helper':
            //             case 'VertexNormalsHelper':
            //             case 'ArrowHelper':
            //                 e.visible = this.engine.debug
            //                 break;
            //         }
            //     })
            //     break;
            //
            case 'KeyF':
                this.engine.actionManager.dispatchEvent(new Event('execute_action'))
                break;
            //
            // case 'ShiftLeft':
            //     this.isRunning = true
            //     break;
            //
            // case 'Space':
            //     if (
            //         !this.engine.chat.isOpen &&
            //         this.canJump
            //     ) {
            //         this.engine.game.player.velocity.y += 50;
            //         this.canJump = false
            //     }
            //     break;
            // case 'Enter':
            // case 'NumpadEnter':
            //     if (this.engine.chat.isActive()) {
            //         //sending chat
            //         if (!this.engine.chat.isEmpty()) {
            //             // console.log('sending chat')
            //
            //             this.engine.serverConnector.socket.emit('chat', this.engine.chat.input.value)
            //             Utils.addMessageToChat(this.engine.chat, this.engine.chat.input.value, this.engine.serverConnector.socket.id)
            //
            //             this.engine.chat.reset()
            //             this.engine.chat.close()
            //         }
            //         else {
            //             // console.log('closing chat')
            //             this.engine.chat.reset()
            //             this.engine.chat.close()
            //         }
            //     } else {
            //         // console.log('opening chat')
            //         this.engine.chat.open()
            //     }
            //     break;
            //
            // case 'Escape':
            //     this.engine.menu.close()
            //     break;
            //
            case 'Tab':
                e.preventDefault()
                // if (this.lastEscapeOrTab + this.lastEscapeOrTabRate < Date.now()) {
                //     this.engine.menu.toggle()
                // }
                break;

            case 'AltLeft':
                // Knife
                e.preventDefault()
                this.engine.weaponManager.dispatchEvent(new Event('knife'))
                break;
        }

    }

    onKeyUp(e) {
        switch ( e.code ) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
            case 'ShiftLeft':
                this.isRunning = false
                break;
        }
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    onMouseDown(e) {
        switch (this.engine.state) {

            case GameEngine.STATES.GAME:
                if (this.engine.controllablePlayer.controls.isLocked) {
                    if (e.button === InputManager.MouseButtons.LEFT) {
                        this.isClicking = true
                    }
                }
            break;
        }
    }


    onMouseUp(e) {
        switch (this.engine.state) {

            case GameEngine.STATES.GAME:
                if (this.engine.controllablePlayer.controls.isLocked) {
                    if (e.button === InputManager.MouseButtons.LEFT) {
                        this.isClicking = false
                    }
                }
                break;
        }
    }

    onMouseWheel(e) {
        Utils.dispatchEventTo('switch', {e: e}, this.engine.weaponManager)
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    onClick(e) {

        if (!this.engine.controllablePlayer.controls.isLocked) {
            this.engine.controllablePlayer.controls.lock()
        }

        switch (this.engine.state) {

            case GameEngine.STATES.GAME:
                if (this.engine.controllablePlayer.controls.isLocked) {
                    if (e.button === InputManager.MouseButtons.LEFT) {
                        this.engine.weaponManager.dispatchEvent(new Event('player-triggering-shot'))
                    }
                }
                break;

            case GameEngine.STATES.MENU:
                break;
        }
    }
}