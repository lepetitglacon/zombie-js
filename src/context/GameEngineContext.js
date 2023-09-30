import {createContext, useState} from "react";

const GameEngineContext = createContext({})

export const GameEngineProvider = ({children}) => {

    const [gameEngine, setGameEngine] = useState(null)

    return <GameEngineContext.Provider value={{ gameEngine: gameEngine, setGameEngine: setGameEngine }}>
        {children}
    </GameEngineContext.Provider>
}

export default GameEngineContext