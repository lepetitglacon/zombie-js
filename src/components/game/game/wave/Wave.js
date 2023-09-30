import './wave.css'

import {useContext, useEffect, useState, useSyncExternalStore} from "react";
import GameEngineContext from "../../../../context/GameEngineContext.js";


function Wave() {

    const {gameEngine, setGameEngine} = useContext(GameEngineContext)

    const [wave, setWave] = useState(gameEngine.game.wave)

    useEffect(() => {
        gameEngine.game.addEventListener('after-wave_update', () => {
            setWave(gameEngine.game.wave)
        })
    }, [])

    return (
        <div id="wave-ui" className="ui-component-container">
            <div id="wave">{wave}</div>
        </div>
    );
}

export default Wave;