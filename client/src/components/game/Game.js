import {useContext, useEffect, useState} from "react";
import {useParams, Link} from 'react-router-dom'
import Lobby from "./lobby/Lobby";
import Z3DGame from "./game/Z3DGame";
import Socket from "../../socket/Socket";
import AuthContext from "../../context/AuthContext";
import useGameState from "../../hooks/useGameState";

export const GAMESTATE = {
    LOBBY: 'LOBBY',
    LOADING: 'LOADING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
}

function Game() {

    const {user} = useContext(AuthContext)
    const {gameState, setGameState} = useGameState()

    const gameId = useParams()['id']
    let socket = Socket(gameId, user._id.toString())


    const [maps, setMaps] = useState()
    const [currentMap, setCurrentMap] = useState()
    const [users, setUsers] = useState()

    useEffect(() => {
        socket.connect()
        return () => {
            socket.disconnect()
        }
    })

    useEffect(() => {
        socket.on('connect', () => console.log('connected'))
        socket.on('disconnect', (reason) => console.log(`disconnected for reason "${reason}"`))
        return () => {
            socket.off('connect')
            socket.off('disconnect')
        }
    })


    return (
        <>

            {gameState === GAMESTATE.LOBBY
                ? <Lobby socket={socket} setGameState={setGameState}/>
                : <Z3DGame socket={socket} setGameState={setGameState}/>
            }



        </>
    );
}

export default Game;