import {useContext, useEffect, useState, useSyncExternalStore} from "react";
import GameEngineContext from "../../../../context/GameEngineContext";


function Weapon({weapon}) {

    const {gameEngine, setGameEngine} = useContext(GameEngineContext)

    const [bullets, setBullets] = useState(weapon.bulletsInMagazine)
    const [maxBullets, setMaxBullets] = useState(weapon.bulletStorage)
    const [name, setName] = useState(weapon.name)

    useEffect(() => {
        gameEngine.weaponManager.addEventListener('after-shot', () => {
            setBullets(gameEngine.weaponManager.weapon.bulletsInMagazine)
        })
    }, [])

    useEffect(() => {
        gameEngine.weaponManager.addEventListener('after-switch', (e) => {
            setBullets(gameEngine.weaponManager.weapon.bulletsInMagazine)
            setMaxBullets(gameEngine.weaponManager.weapon.bulletStorage)
            setName(gameEngine.weaponManager.weapon.name)
        })
    }, [])

    useEffect(() => {
        gameEngine.weaponManager.addEventListener('after-reload', (e) => {
            setBullets(gameEngine.weaponManager.weapon.bulletsInMagazine)
            setMaxBullets(gameEngine.weaponManager.weapon.bulletStorage)
        })
    }, [])

    return (
        <div>
            <div>{name}</div>
            <div>{bullets}/{maxBullets}</div>
        </div>
    );
}

export default Weapon;