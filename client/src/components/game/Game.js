import {useContext, useEffect, useState} from "react";
import {useParams, Link} from 'react-router-dom'
import Lobby from "./lobby/Lobby";
import * as Z3DGame from "./game/Game";
import Socket from "../../socket/Socket";
import AuthContext from "../../context/AuthContext";

const GAMESTATE = {
    LOBBY: 'lobby',
    RUNNING: 'running',
    COMPLETED: 'completed',
}

function Game() {

    const {user} = useContext(AuthContext)

    const gameId = useParams()['id']
    let socket = Socket(gameId, user._id.toString())

    const [gameState, setGameState] = useState(GAMESTATE.LOBBY)
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
                ? <Lobby socket={socket}/>
                : <Z3DGame/>
            }



        </>
    );
}

export default Game;