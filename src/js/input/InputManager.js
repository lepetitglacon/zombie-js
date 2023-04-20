export default class InputManager {

    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;
    canJump = false;

    constructor() {
        this.init()
    }

    init() {
        this.onKeyDownE = this.onKeyDown.bind( this );
        this.onKeyUpE = this.onKeyUp.bind( this );
        document.addEventListener( 'keydown', this.onKeyDownE );
        document.addEventListener( 'keyup', this.onKeyUpE );
    }

    onKeyDown = function ( event ) {
        switch ( event.code ) {
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
                this.moveRight = true;
                break;
            case 'Space':
                if (window.ZombieGame.chatInput !== document.activeElement) {
                    window.ZombieGame.game.velocity.y += 25;
                }
                break;
            case 'Enter':
            case 'NumpadEnter':
                if (window.ZombieGame.chatInput === document.activeElement) {
                    //sending chat
                    if (window.ZombieGame.chatInput.value !== '') {
                        window.ZombieGame.game.socket.emit('chat', window.ZombieGame.chatInput.value)
                        const msgLi = document.createElement('li')
                        msgLi.innerText = '~vous : ' + window.ZombieGame.chatInput.value
                        window.ZombieGame.chatUl.appendChild(msgLi)
                        window.ZombieGame.chatInput.value = ''
                        window.ZombieGame.chatInput.classList.toggle('hidden')
                        document.activeElement.blur()
                        window.ZombieGame.game.three.controls.lock()
                    }
                    // closing chat
                    else {
                        window.ZombieGame.chatInput.classList.toggle('hidden')
                        document.activeElement.blur()
                        window.ZombieGame.game.three.controls.lock()
                    }
                } else {
                    // focusing chat
                    window.ZombieGame.game.three.controls.unlock()
                    window.ZombieGame.chatInput.classList.toggle('hidden')
                    window.ZombieGame.chatInput.focus({preventScroll: true})
                }
                break;

            case 'Escape':



                break;
        }
    };

    onKeyUp = function ( event ) {
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
    };


}