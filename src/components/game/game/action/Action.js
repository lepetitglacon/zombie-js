import './styles.css'

import {useContext, useEffect, useState} from "react";
import GameEngineContext from "../../../../context/GameEngineContext.js";


function Action() {

    const {gameEngine, setGameEngine} = useContext(GameEngineContext)

    const [action, setAction] = useState('')

    useEffect(() => {
        gameEngine.actionManager.addEventListener('UI:after_message_set', () => {
            setAction(gameEngine.actionManager.message)
        })
    }, [])

    return (
        <div id="action-ui" className="ui-component-container">
            <div id="action_container">
                <p>{action}</p>
            </div>
        </div>
    );
}

export default Action;