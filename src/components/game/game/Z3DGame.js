import './z3dgame.css'

import {useCallback, useContext, useEffect, useRef, useState} from "react";
import GameEngine from "../../../game/GameEngine.js";
import GameContext from "../../../context/GameContext.js";
import {GAMESTATE} from "../Game.js";
import {useParams} from "react-router-dom";
import LoadingSpinner from "../../utils/LoadingSpinner.js";
import ENV from "../../../ENV.js";
import WeaponManager from "./weapons/WeaponManager.js";
import GameEngineContext from "../../../context/GameEngineContext.js";
import Wave from "./wave/Wave.js";
import Points from "./points/Points.js";
import Action from "./action/Action.js";

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
    const {gameEngine, setGameEngine} = useContext(GameEngineContext)

    const gameId = useParams()['id']

    const [loadingState, setLoadingState] = useState(LoadingStates.CONNECT)
    const [gameState, setGameState] = useState(GameStates.LOADING)

    const [players, setPlayers] = useState([])

    const setThreeDivRef = useCallback(node => {
        if (node) {
            gameEngine.setRendererElement(node)
        }
    }, [gameEngine])

    const setGameUiRef = useCallback(node => {
        if (node) {
            gameEngine.setUiNode(node)
        }
    }, [gameEngine])

    useEffect(() => {
        console.clear()
        const setEngine = async () => {
            await setGameEngine(new GameEngine({
                socket,
                gameId,
                setGameState,
                setLoadingState,
                setPlayers
            }))
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
                    <div id="game-container">
                        <div id="game-ui" ref={setGameUiRef} >

                            <div id="crosshair-ui" className="ui-component-container">
                                <img src={ENV.SERVER_HOST + 'assets/img/crosshair.png'} width="100px" height="100px" alt=""/>
                            </div>

                            <WeaponManager />
                            <Wave />
                            <Points />
                            <Action />

                            <div id="player-ui" className="ui-component-container">
                                {players.map((player, i) => {
                                    return <div key={i} className={player.color}>
                                        <div>{player.gamename}</div>
                                        <div>{player.points}</div>
                                    </div>
                                })}
                            </div>
                        </div>
                        <div id="three-container" ref={setThreeDivRef}></div>
                    </div>
                )
            }

        </div>
    );
}

export default Z3DGame;