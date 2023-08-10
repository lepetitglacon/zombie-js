import {useContext, useEffect, useState} from "react";
import {useParams, Link} from 'react-router-dom'
import Lobby from "./lobby/Lobby";
import Z3DGame from "./game/Z3DGame";
import Socket from "../../socket/Socket";
import AuthContext from "../../context/AuthContext";
import useGameState from "../../hooks/useGameState";

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


    const [maps, setMaps] = useState()
    const [currentMap, setCurrentMap] = useState()
    const [users, setUsers] = useState()

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
            console.log('[game] deleting socket events')
            socket.off('connect')
            socket.off('custom-disconnect')
            socket.off('disconnect')
        }
    }, [])

    return (
        <>

            {clientState === GAMESTATE.LOBBY || clientState === GAMESTATE.NOGAME
                ? <Lobby socket={socket}/>
                : <Z3DGame socket={socket}/>
            }

        </>
    );
}

export default Game;