import {createContext, useEffect, useState} from "react";
import {GAMESTATE} from "../components/game/Game.js";

const GameContext = createContext({})

export const GameProvider = ({children}) => {

    const [clientState, setClientState] = useState(GAMESTATE.NOGAME)

    return <GameContext.Provider value={{ clientState: clientState, setClientState: setClientState }}>
        {children}
    </GameContext.Provider>
}

export default GameContext