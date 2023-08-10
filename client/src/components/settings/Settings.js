import {useVolume} from "../../context/AudioContext";
import {useEffect, useRef} from "react";

function Settings() {

    const {volume, setVolume} = useVolume()

    const generalMusicVolumeRef = useRef()

    const handleVolumeChange = (e) => {
        setVolume(e.target.value)
    }

    useEffect(() => {
        generalMusicVolumeRef.current.value = volume
    }, [])

    return (
        <div>
            <h2>Settings</h2>

            <div>
                <h3>General</h3>

                <div>
                    <h4>Music Volume</h4>
                    <input ref={generalMusicVolumeRef}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        onChange={handleVolumeChange}
                    />
                </div>

            </div>

            <div>
                <h3>Game</h3>
            </div>

            <div>
                <h3>Controls</h3>
            </div>

        </div>
    )
}
export default Settings