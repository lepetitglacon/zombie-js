import * as THREE from "three";

// assets
import "../../client/assets/sound/gunshot.wav"
import "../../client/assets/sound/gunreload.mp3"

export default class SoundManager {

    constructor(props) {
        this.loader = new THREE.AudioLoader();

        this.listener = new THREE.AudioListener();
        props.camera.add( this.listener );

        this.sounds = new Map()
        this.loadSounds()
    }

    loadSound(name, path) {
        const sound = new THREE.Audio( this.listener );
        this.loader.load( path, ( buffer ) => {
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( .5 );
        });
        this.sounds.set(name, sound)
    }

    loadSounds() {
        this.loadSound('weapon_pistol_shot', 'src/client/assets/sound/gunshot.wav')
        this.loadSound('weapon_pistol_reload', 'src/client/assets/sound/gunreload.mp3')
    }

    play(name) {
        if (this.sounds.has(name)) {
            this.sounds.get(name).play()
            this.sounds.get(name).onEnded()
        }
    }

}