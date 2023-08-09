import {useContext} from "react";
import GameContext from "../context/GameContext";


const useGameState = () => {
    return useContext(GameContext)
}
export default useGameState