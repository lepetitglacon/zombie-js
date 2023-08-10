import {useContext, useEffect, useRef} from "react";
import GameEngine from "../../../game/GameEngine";
import GameContext from "../../../context/GameContext";
import {GAMESTATE} from "../Game";

function Z3DGame({socket}) {

    const {gameState, setGameState} = useContext(GameContext)

    useEffect(() => {
        let gameEngine = new GameEngine({socket})

        return () => {
            gameEngine = null
            setGameState(GAMESTATE.NOGAME)
        }
    }, [])



    return (
        <div>
            <h1>GAMING</h1>
            <img src="https://img.redbull.com/images/c_crop,x_1926,y_0,h_3769,w_2827/c_fill,w_400,h_540/q_auto:low,f_auto/redbullcom/2023/3/22/pjjsk4mejcei48nl7sfd/alderiate-red-bull-challengers-league-of-legends" alt=""/>
            <div></div>
        </div>
    );
}

export default Z3DGame;