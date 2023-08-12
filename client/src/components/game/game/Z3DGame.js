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

function Z3DGame({socket, gameEngine, setGameEngine}) {

    const {clientState, setClientState} = useContext(GameContext)

    const gameId = useParams()['id']

    const [loadingState, setLoadingState] = useState(LoadingStates.CONNECT)
    const [gameState, setGameState] = useState(GameStates.LOADING)

    const setThreeDivRef = useCallback(node => {
        if (node) {
            gameEngine.setRendererElement(node)
        }
    }, [gameEngine])

    useEffect(() => {
        console.clear()
        const setEngine = async () => {
            await setGameEngine(new GameEngine({socket, gameId, setGameState, setLoadingState}))
        }
        setEngine()
        return () => {
            console.log('[GAME] children cleanup')
        }
    }, [])

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