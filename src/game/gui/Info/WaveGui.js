export default class WaveGui {

    constructor() {
        this.div = document.getElementById('wave')
        this.wave = 0
    }

    setWave(wave) {
        this.div.style.transitionDuration = '2s'
        this.div.style.opacity = '0'
        this.wave = wave

        window.ZombieGame.soundManager.play('wave_end')

        setTimeout(() => {
            this.div.style.transitionDuration = '2s'
            this.div.innerText = this.romanize(wave)
            this.div.style.opacity = '100'
            window.ZombieGame.soundManager.play('wave_start')
        }, 8000)
    }

    romanize(num) {
        var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},
            roman = '',
            i;
        for ( i in lookup ) {
            while ( num >= lookup[i] ) {
                roman += i;
                num -= lookup[i];
            }
        }
        return roman;
    }
}