import * as THREE from "three";
import ENV from "../../ENV.js";

// assets
// import "../../client/assets/sound/gunshot.wav"
// import "../../client/assets/sound/gunreload.mp3"
// import "../../client/assets/sound/knife.wav"
// import "../../client/assets/sound/wave/start.wav"
// import "../../client/assets/sound/wave/end.wav"

export default class SoundManager {

    constructor({engine}) {
        this.engine = engine
        this.loader = new THREE.AudioLoader();

        this.sounds = new Map()
        this.positionalSounds = new Map()

        this.listener = new THREE.AudioListener();
        this.engine.three.camera.add( this.listener );
    }

    loadAndGetPositionalSound(name, path) {
        const sound = new THREE.PositionalAudio( this.listener );
        this.loader.load( path, ( buffer ) => {
            sound.setBuffer( buffer );
            sound.setRefDistance( 20 );
            sound.setLoop( false );
            sound.setVolume( .1 );
        });
        return sound
    }

    loadPositionalSound(name, path) {
        const sound = new THREE.PositionalAudio( this.listener );
        this.loader.load( path, ( buffer ) => {
            sound.setBuffer( buffer );
            sound.setRefDistance( 20 );
            sound.setLoop( false );
            sound.setVolume( .1 );
        });
        this.positionalSounds.set(name, sound)
    }

    loadSound(name, path) {
        const sound = new THREE.Audio( this.listener );
        this.loader.load( ENV.SERVER_HOST + path, ( buffer ) => {
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( .5 );
        },
            () => {},
            (error) => {
            console.error(error)
            });
        this.sounds.set(name, sound)
        console.log(`[ASSETS][SOUND] sound ${name} loaded`)
    }

    async loadSounds() {
        this.loadSound('weapon_pistol_shot', 'assets/sound/gunshot.wav')
        this.loadSound('weapon_pistol_reload', 'assets/sound/gunreload.mp3')
        this.loadSound('weapon_knife_slash', 'assets/sound/knife.wav')
        this.loadSound('wave_start', 'assets/sound/wave/start.wav')
        this.loadSound('wave_end', 'assets/sound/wave/end.wav')
    }

    play(name) {
        if (this.sounds.has(name)) {
            this.sounds.get(name).play()
            this.sounds.get(name).onEnded()
        }
    }

    get(name) {
        if (this.sounds.has(name)) {
            return this.sounds.get(name)
        }
    }

    getPositional(name) {
        if (this.positionalSounds.has(name)) {
            return this.positionalSounds.get(name)
        }
    }

    // bind() {
    //     this.soundInput = document.getElementById('sound-input')
    //
    //     this.soundInput.value = 0.1
    //     this.soundInput.addEventListener('input', (e) => {
    //         for (const [name, sound] of this.sounds) {
    //             sound.setVolume(parseFloat(e.target.value))
    //         }
    //     })
    // }

}