import {useContext} from "react";
import GameContext from "../context/GameContext.js";


const useGameState = () => {
    return useContext(GameContext)
}
export default useGameState