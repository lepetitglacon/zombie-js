import ZombieGame from "../ZombieGame.js";

export default class InputManager {



    constructor() {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.isChatOpen = false;
        this.init()
    }

    init() {
        document.addEventListener( 'keydown', (e) => {
            // console.log(e)

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
                    window.ZombieGame.game.weaponHandler.reload()
                    break;

                case 'Space':
                    if (window.ZombieGame.chatInput !== document.activeElement && this.canJump) {
                        window.ZombieGame.game.velocity.y += 25;
                        this.canJump = false
                    }
                    break;
                case 'Enter':
                case 'NumpadEnter':
                    if (window.ZombieGame.chatInput === document.activeElement) {
                        //sending chat
                        // console.log('sending chat')
                        if (window.ZombieGame.chatInput.value !== '') {
                            window.ZombieGame.game.serverConnector.socket.emit('chat', window.ZombieGame.chatInput.value)
                            const msgLi = document.createElement('li')
                            msgLi.innerText = 'YOU : ' + window.ZombieGame.chatInput.value
                            window.ZombieGame.chatUl.appendChild(msgLi)
                            window.ZombieGame.chatInput.value = ''
                            // window.ZombieGame.chatInput.classList.toggle('hidden')
                            document.activeElement.blur()
                            this.isChatOpen = false
                            window.ZombieGame.game.three.controls.lock()
                        }
                        // closing chat
                        else {
                            // console.log('closing chat')
                            // window.ZombieGame.chatInput.classList.toggle('hidden')
                            document.activeElement.blur()
                            this.isChatOpen = false
                            window.ZombieGame.game.three.controls.lock()
                        }
                    } else {
                        // focusing chat
                        // console.log('focusing chat')
                        window.ZombieGame.game.three.controls.unlock()
                        // window.ZombieGame.chatInput.classList.toggle('hidden')
                        window.ZombieGame.chatInput.focus({preventScroll: true})
                        this.isChatOpen = true
                    }
                    break;

                case 'Tab':
                    e.preventDefault()
                    this.openGameMenu()
                    break;

                case 'Escape':
                    window.ZombieGame.state = ZombieGame.STATE.GAME
                    break;

                case 'AltLeft':
                    e.preventDefault()
                    console.log('alt knife')
                    window.ZombieGame.game.weaponHandler.raycaster.setFromCamera( window.ZombieGame.game.weaponHandler.pointer, window.ZombieGame.game.three.camera );
                    window.ZombieGame.game.weaponHandler.knife.shoot()
                    break;
            }
        });

        document.addEventListener( 'keyup', ( event ) => {
            switch ( event.code ) {
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
            }
        })

        document.addEventListener('click', (e) => {
            switch (window.ZombieGame.state) {


                case ZombieGame.STATE.GAME:
                    if (window.ZombieGame.game.three.controls.isLocked) {

                        // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
                        if (e.button === 0) {
                            window.ZombieGame.game.weaponHandler.raycaster.setFromCamera( window.ZombieGame.game.weaponHandler.pointer, window.ZombieGame.game.three.camera );
                            window.ZombieGame.game.weaponHandler.shoot()
                        }

                    } else {

                        if (window.ZombieGame.game.inputManager.isChatOpen && !window.ZombieGame.chatInput.classList.contains('hidden')) {
                            window.ZombieGame.chatInput.classList.toggle('hidden')
                            window.ZombieGame.chatInput.value = ''
                            window.ZombieGame.game.inputManager.isChatOpen = false
                        }
                        if (!window.ZombieGame.optionMenu.classList.contains('d-none')) {
                            !window.ZombieGame.optionMenu.classList.toggle('d-none')
                        }
                        window.ZombieGame.game.three.controls.lock()
                    }
                    break;

                case ZombieGame.STATE.OPTION:

                    if (window.ZombieGame.optionMenu.classList.contains('d-none')) {
                        window.ZombieGame.state = ZombieGame.STATE.GAME
                        window.ZombieGame.game.three.controls.lock()
                    }

                    break;
            }
        })
    }

    openGameMenu() {
        window.ZombieGame.game.three.controls.unlock()
        window.ZombieGame.optionMenu.classList.toggle('d-none')
        window.ZombieGame.state = ZombieGame.STATE.OPTION
    }


}