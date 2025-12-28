import { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";

export function useAudioPlayer(soundUrl: string) {
    const soundRef = useRef<Audio.Sound | null>(null);

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [trackDuration, setTrackDuration] = useState(0);

    useEffect(() => {
        let mounted = true;

        const loadSound = async () => {
            try {
                setProgress(0);
                setTrackDuration(0);

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });

                if (soundRef.current) {
                    await soundRef.current.unloadAsync();
                    soundRef.current = null;
                }

                const { sound: loadedSound } = await Audio.Sound.createAsync(
                    { uri: soundUrl },
                    { shouldPlay: true }
                );

                if (!mounted) {
                    await loadedSound.unloadAsync();
                    return;
                }

                soundRef.current = loadedSound;
                setSound(loadedSound);

                loadedSound.setOnPlaybackStatusUpdate(status => {
                    if (!mounted || !status.isLoaded) return;

                    setProgress(status.positionMillis / 1000);

                    if (status.durationMillis) {
                        setTrackDuration(status.durationMillis / 1000);
                    }

                    setIsPlaying(status.isPlaying);
                });

            } catch (error) {
                console.error("Error loading sound:", error);
            }
        };

        loadSound();

        return () => {
            mounted = false;
            if (soundRef.current) {
                soundRef.current.setOnPlaybackStatusUpdate(null);
                soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        };
    }, [soundUrl]);

    const togglePlay = useCallback(async () => {
        if (!sound) return;

        try {
            const status = await sound.getStatusAsync();
            if (!status.isLoaded) return;

            if (status.isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        } catch (error) {
            console.error("Error toggling playback:", error);
        }
    }, [sound]);

    return {
        sound,
        isPlaying,
        progress,
        trackDuration,
        togglePlay,
    };
}
