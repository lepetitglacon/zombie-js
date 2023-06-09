import * as THREE from "three";

// assets
import "../../client/assets/sound/gunshot.wav"
import "../../client/assets/sound/gunreload.mp3"
import "../../client/assets/sound/knife.wav"
import "../../client/assets/sound/wave/start.wav"
import "../../client/assets/sound/wave/end.wav"

export default class SoundManager {

    constructor() {
        this.loader = new THREE.AudioLoader();

        this.sounds = new Map()
        this.positionalSounds = new Map()
    }

    init() {
        this.listener = new THREE.AudioListener();
        window.ZombieGame.game.three.camera.add( this.listener );
        this.loadSounds()
        this.bind()
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
        this.loader.load( path, ( buffer ) => {
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( .1 );
        });
        this.sounds.set(name, sound)
    }

    loadSounds() {
        this.loadSound('weapon_pistol_shot', 'src/client/assets/sound/gunshot.wav')
        this.loadSound('weapon_pistol_reload', 'src/client/assets/sound/gunreload.mp3')
        this.loadSound('weapon_knife_slash', 'src/client/assets/sound/knife.wav')
        this.loadSound('wave_start', 'src/client/assets/sound/wave/start.wav')
        this.loadSound('wave_end', 'src/client/assets/sound/wave/end.wav')

        // this.loadPositionalSound('weapon_pistol_shot', 'src/client/assets/sound/gunshot.wav')
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

    bind() {
        this.soundInput = document.getElementById('sound-input')

        this.soundInput.value = 0.1
        this.soundInput.addEventListener('input', (e) => {
            for (const [name, sound] of this.sounds) {
                sound.setVolume(parseFloat(e.target.value))
            }
        })
    }

}