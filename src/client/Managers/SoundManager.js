import * as THREE from "three";

export default class SoundManager {

    constructor(props) {
        this.loader = new THREE.AudioLoader();
        this.listener = new THREE.AudioListener();



        this.sounds = new Map()

        if (this.soundReload.buffer == null) {
            window.ZombieGame.game.three.camera.add( this.listener );
            const audioLoader =
            audioLoader
        }
        this.soundReload.play()
        this.soundReload.onEnded()

    }

    loadSound(name, path) {
        this.loader.load( path, ( buffer ) => {
            this.soundReload.setBuffer( buffer );
            this.soundReload.setLoop( false );
            this.soundReload.setVolume( 1 );
        });
        this.sounds.set(name, new THREE.Audio( this.listener ))
    }

    loadSounds() {

    }

    play(name) {
        if (this.sounds.has(name)) {
            this.sounds.get(name).play()
            this.sounds.get(name).onEnded()
        }
    }

}