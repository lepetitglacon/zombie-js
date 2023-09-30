import {useContext, useEffect, useState} from "react";
import {useParams, Link} from 'react-router-dom'
import Lobby from "./lobby/Lobby.js";
import Z3DGame from "./game/Z3DGame.js";
import Socket from "../../socket/Socket.js";
import AuthContext from "../../context/AuthContext.js";
import useGameState from "../../hooks/useGameState.js";
import GameEngineContext from "../../context/GameEngineContext.js";

export const GAMESTATE = {
    NOGAME: 'NOGAME',
    LOBBY: 'LOBBY',
    LOADING: 'LOADING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
}

function Game() {

    const {user} = useContext(AuthContext)
    const {clientState, setClientState} = useGameState()

    const gameId = useParams()['id']
    let socket = Socket(gameId, user._id.toString())

    const {gameEngine, setGameEngine} = useContext(GameEngineContext)

    useEffect(() => {
        socket.connect()
        return () => {
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        socket.on('connect', () => console.log('[SOCKET] connected'))
        socket.on('custom-disconnect', (reason) => console.log(`[SOCKET] disconnected for reason "${reason}"`))
        socket.on('disconnect', (reason) => console.log(`[SOCKET] disconnected`))
        return () => {
            console.log('[GAME] deleting socket events')
            socket.off('connect')
            socket.off('custom-disconnect')
            socket.off('disconnect')
        }
    }, [])

    useEffect(() => {
        return () => {
            console.log('[GAME] cleanup Game')
            console.log('[GAME] deleting gameEngine')

            if (gameEngine) {
                setClientState(GAMESTATE.NOGAME)
                gameEngine.cleanup()
                setGameEngine(null)
                console.log('[GAME] gameEngine deleted')
            }
        }
    }, [gameEngine])

    return (
        <>

            {clientState === GAMESTATE.LOBBY || clientState === GAMESTATE.NOGAME
                ? <Lobby socket={socket}/>
                : <Z3DGame socket={socket} gameEngine={gameEngine} setGameEngine={setGameEngine} />
            }

        </>
    );
}

export default Game;