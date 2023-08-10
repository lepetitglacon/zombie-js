import {createContext, useEffect, useState} from "react";
import {GAMESTATE} from "../components/game/Game";

const GameContext = createContext({})

export const GameProvider = ({children}) => {

    const [gameState, setGameState] = useState(GAMESTATE.NOGAME)

    return <GameContext.Provider value={{ gameState, setGameState }}>
        {children}
    </GameContext.Provider>
}

export default GameContext