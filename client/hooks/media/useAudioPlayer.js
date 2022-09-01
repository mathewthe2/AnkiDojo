import { useState } from 'react';
import { Howl } from "howler";

function useAudioPlayer({playbackSpeed}) {
    const [player, setPlayer] = useState([]);
    const [soundPosition, setSoundPosition] = useState();
    
    const playAudio = (source) => {
        let sound = new Howl({
        src: [source],  html5: true
        });
        if (player.length > 0) {
        player.forEach(sound=>sound.pause())
        }
        let newPlayer = [];
        sound.rate(playbackSpeed)
        newPlayer.push(sound)
        setPlayer(newPlayer)
        newPlayer[0].play();
    }

    const playWithSeek = (url) => {
        function isPlaying(){
            if(sound.playing()){
               setSoundPosition(sound.seek()*1000);
               setTimeout(isPlaying, 10); 
            }
         }
        let sound = new Howl({
            src: [url],  html5: true,   autoplay: true,
            onplay: isPlaying
        });
        if (player.length > 0) {
            player.forEach(sound=>sound.pause())
        }
        let newPlayer = [];
        sound.rate(playbackSpeed);
        if (soundPosition) {
            sound.seek(soundPosition/1000)
        }
        newPlayer.push(sound)
        setPlayer(newPlayer)
        newPlayer[0].play();
    }

    const pauseAudio = () => {
        if (player.length > 0) {
            player.forEach(sound=>sound.pause())
        }
    }

    const stopAudio = () => {
        pauseAudio();
        setPlayer([]);
    }

    return {
        player,
        playAudio,
        pauseAudio,
        stopAudio,
        playWithSeek,
        soundPosition,
    }
}

export default useAudioPlayer


