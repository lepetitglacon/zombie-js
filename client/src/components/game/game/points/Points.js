import './points.css'

import {useContext, useEffect, useState} from "react";
import GameEngineContext from "../../../../context/GameEngineContext";


function Points() {

    const {gameEngine, setGameEngine} = useContext(GameEngineContext)

    const [points, setPoints] = useState(gameEngine.controllablePlayer.points)
    const [players, setPlayers] = useState(gameEngine.playerManager.PLAYERS)

    useEffect(() => {
        gameEngine.playerManager.addEventListener('after-connect', () => {
            console.log('after-connect')
            setPlayers(gameEngine.playerManager.PLAYERS)
        })
    }, [])

    useEffect(() => {
        gameEngine.controllablePlayer.addEventListener('after_own_shot', () => {
            setPoints(gameEngine.controllablePlayer.points)
        })
    }, [])

    return (
        <div id="points-ui" className="ui-component-container">
            <div id="own_info">
                <div >
                    <span>{points}</span>
                </div>
            </div>
            {/*<div id="other_player_points">*/}
            {/*    {players.values().map((player, i) => {*/}
            {/*        return <div key={i}>*/}
            {/*            <span>{player.gamename}</span>*/}
            {/*            <span>{player.points}</span>*/}
            {/*        </div>*/}
            {/*    })}*/}
            {/*</div>*/}
        </div>
    );
}

export default Points;