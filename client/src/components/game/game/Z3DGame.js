import {useCallback, useContext, useEffect, useRef, useState} from "react";
import GameEngine from "../../../game/GameEngine";
import GameContext from "../../../context/GameContext";
import {GAMESTATE} from "../Game";
import {useParams} from "react-router-dom";
import LoadingSpinner from "../../utils/LoadingSpinner";

export const GameStates = {
    LOADING: 'LOADING',
    MENU: 'MENU',
    OPTION: 'OPTION',
    GAME: 'GAME',
    CHAT: 'CHAT',
}

export const LoadingStates = {
    CONNECT: 'Connecting to server',
    ASSETS: 'Loading assets',
    INIT: 'Initializing'
}

function Z3DGame({socket}) {

    const {clientState, setClientState} = useContext(GameContext)

    const gameId = useParams()['id']

    const [loadingState, setLoadingState] = useState(LoadingStates.CONNECT)
    const [gameState, setGameState] = useState(GameStates.LOADING)
    const [gameEngine, setGameEngine] = useState(null)

    const setThreeDivRef = useCallback(node => {
        if (node) {
            gameEngine.setRendererElement(node)
        }
    }, [gameEngine])

    useEffect(() => {
        setGameEngine(new GameEngine({socket, gameId, setGameState, setLoadingState}))
        return () => {
            setGameEngine(null)
            setClientState(state => GAMESTATE.NOGAME)
        }
    }, [])

    useEffect(() => {
        console.log(gameState)
    }, [gameState])

    return (
        <div>
            {gameState === GameStates.LOADING
                ? (
                    <div className="d-flex justify-content-center align-items-center fullscreen">
                        <div className="d-flex flex-column align-items-center text-center">
                        <LoadingSpinner/>
                        <p>{loadingState}</p>
                        </div>
                    </div>
                )
                : (
                    <div id="three-container" ref={setThreeDivRef}></div>
                )
            }

        </div>
    );
}

export default Z3DGame;