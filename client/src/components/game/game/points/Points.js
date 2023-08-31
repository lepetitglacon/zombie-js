import './points.css'

import {useContext, useEffect, useState} from "react";
import GameEngineContext from "../../../../context/GameEngineContext";


function Points() {

    const {gameEngine, setGameEngine} = useContext(GameEngineContext)

    const [points, setPoints] = useState(gameEngine.controllablePlayer.points)
    const [players, setPlayers] = useState([])

    useEffect(() => {
        gameEngine.playerManager.addEventListener('after-connect', () => {
        })
    }, [])

    useEffect(() => {
        gameEngine.controllablePlayer.addEventListener('points', () => {
            setPoints(gameEngine.controllablePlayer.points)

            setPlayers(players => {
                return players.map(p => {
                    if (gameEngine.playerManager.PLAYERS.has(p._id)) {
                        p.points = gameEngine.playerManager.PLAYERS.get(p._id).points
                    }
                })
            })


        })
    }, [])

    return (
        <div id="points-ui" className="ui-component-container">
            <div id="own_info">
                <div >
                    <span>{points}</span>
                </div>
            </div>
            <div id="other_player_points">
                {players.map((player, i) => {
                    return <div key={i}>
                        <span>{player.points}</span>
                    </div>
                })}
            </div>
        </div>
    );
}

export default Points;