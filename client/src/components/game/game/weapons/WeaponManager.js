import {useCallback, useContext, useEffect, useRef, useState} from "react";
import GameEngineContext from "../../../../context/GameEngineContext";
import Weapon from "./Weapon";

function WeaponManager() {

    const {gameEngine, setGameEngine} = useContext(GameEngineContext)

    const [currentWeapon, setCurrentWeapon] = useState(gameEngine.weaponManager.weapon)

    return (
        <div id="weapon-ui" className="ui-component-container">
            <Weapon weapon={currentWeapon}/>
        </div>
    );
}

export default WeaponManager;