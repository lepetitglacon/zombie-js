import {createContext, useContext, useEffect, useState} from "react";
import Cookies from "js-cookie";

import ENV from "../ENV";

const VolumeContext = createContext();

export const useVolume = () => {
    return useContext(VolumeContext);
};

export const VolumeProvider = ({ children }) => {

    const [audioFile, setAudioFile] = useState(new Audio(ENV.SERVER_HOST + 'assets/sound/mainlobby.mp3'))
    const [volume, setVolume] = useState(0.5); // Default volume
    const [isMuted, setIsMuted] = useState(false);

    const play = () => {
        audioFile.play()
    }

    const pause = () => {
        audioFile.pause()
    }

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    useEffect(() => {

        let savedVolume = Cookies.get('volume');
        if (savedVolume) {
            savedVolume = JSON.parse(savedVolume)
            setIsMuted(savedVolume.muted);
            setVolume(savedVolume.volume);
        }

        audioFile.onended = () => {
            audioFile.play()
        }
    }, [])

    useEffect(() => {
        audioFile.volume = isMuted ? 0 : volume
        Cookies.set('volume', JSON.stringify({
            volume: volume,
            muted: isMuted
        }), { expires: 30 })

    }, [volume, isMuted])

    return (
        <VolumeContext.Provider value={{ volume, setVolume, isMuted, toggleMute, play, pause }}>
            {children}
        </VolumeContext.Provider>
    );
};