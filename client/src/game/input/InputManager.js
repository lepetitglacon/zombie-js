import GameEngine from "../GameEngine.js";

export default class InputManager {

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
        // document.addEventListener('click', this.onClick)
        document.addEventListener( 'keyup', this.onKeyUp)
        // document.addEventListener( 'keydown', this.onKeyDown);
        // document.addEventListener('mouseup', this.onMouseUp)
        // document.addEventListener('mousedown', this.onMouseDown)
        // document.addEventListener('wheel', this.onMouseWheel)
    }

    cleanup() {
        // document.removeEventListener('click', this.onClick)
        document.removeEventListener( 'keyup', this.onKeyUp)
        // document.removeEventListener( 'keydown', this.onKeyDown);
        // document.removeEventListener('mouseup', this.onMouseUp)
        // document.removeEventListener('mousedown', this.onMouseDown)
        // document.removeEventListener('wheel', this.onMouseWheel)
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

            // case 'KeyR':
            //     this.engine.game.weaponHandler.reload()
            //     break;
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
            // case 'KeyF':
            //     let door = this.engine.actionGui.door
            //     if (door !== null) {
            //         door.buy()
            //     }
            //     break;
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
            // case 'Tab':
            //     e.preventDefault()
            //     if (this.lastEscapeOrTab + this.lastEscapeOrTabRate < Date.now()) {
            //         this.engine.menu.toggle()
            //     }
            //     break;
            //
            // case 'AltLeft':
            //     // Knife
            //     e.preventDefault()
            //     this.engine.game.weaponHandler.knife.shoot()
            //     break;
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

    onMouseDown(e) {
        switch (this.engine.state) {
            case GameEngine.STATE.GAME:
                if (this.engine.game.three.controls.isLocked) {
                    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
                    if (e.button === 0) {
                        this.isClicking = true
                    }
                } else {
                    // hide option menu
                    if (this.engine.menu.isOpen()) {
                        this.engine.menu.close()
                    }
                    // hide chat
                    if (this.isChatOpen && !this.engine.chatInput.classList.contains('hidden')) {
                        this.engine.chatInput.classList.toggle('hidden')
                        this.engine.chatInput.value = ''
                        this.isChatOpen = false
                    }
                    this.engine.game.three.controls.lock()
                }
                break;

            case GameEngine.STATE.MENU:
                break;
        }
    }

    onMouseWheel(e) {
        switch (this.engine.state) {

            case GameEngine.STATE.GAME:
                if (this.engine.game.three.controls.isLocked) {
                    this.engine.game.weaponHandler.dispatchEvent(new Event('switch', e))
                } else {

                    // hide option menu
                    if (this.engine.menu.isOpen()) {
                        this.engine.menu.close()
                    }

                    // hide chat
                    if (this.isChatOpen && !this.engine.chatInput.classList.contains('hidden')) {
                        this.engine.chatInput.classList.toggle('hidden')
                        this.engine.chatInput.value = ''
                        this.isChatOpen = false
                    }

                    this.engine.game.three.controls.lock()
                }
                break;
        }
    }

    onMouseUp(e) {
        switch (this.engine.state) {
            case GameEngine.STATE.GAME:
                if (this.engine.game.three.controls.isLocked) {
                    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
                    if (e.button === 0) {
                        this.isClicking = false
                    }
                } else {
                    // hide option menu
                    if (this.engine.menu.isOpen()) {
                        this.engine.menu.close()
                    }
                    // hide chat
                    if (this.isChatOpen && !this.engine.chatInput.classList.contains('hidden')) {
                        this.engine.chatInput.classList.toggle('hidden')
                        this.engine.chatInput.value = ''
                        this.isChatOpen = false
                    }
                    this.engine.game.three.controls.lock()
                }
                break;
            case GameEngine.STATE.MENU:
                break;
        }
    }

    onClick(e) {
        this.engine.three.controls.lock()
        switch (this.engine.state) {
            case GameEngine.STATE.GAME:
                if (this.engine.game.three.controls.isLocked) {
                    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
                    if (e.button === 0) {
                        this.engine.game.weaponHandler.shoot()
                    }
                } else {
                    // hide option menu
                    if (this.engine.menu.isOpen()) {
                        this.engine.menu.close()
                    }
                    // hide chat
                    if (this.isChatOpen && !this.engine.chatInput.classList.contains('hidden')) {
                        this.engine.chatInput.classList.toggle('hidden')
                        this.engine.chatInput.value = ''
                        this.isChatOpen = false
                    }
                    this.engine.game.three.controls.lock()
                }
                break;
            case GameEngine.STATE.MENU:
                break;
        }
    }
}