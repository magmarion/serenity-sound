import { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";

export function useSleepTimer(sound: Audio.Sound | null) {
    const [sleepTimerActive, setSleepTimerActive] = useState(false);
    const [sleepTimerDuration, setSleepTimerDuration] = useState<number | null>(null);
    const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0);
    const [showSleepTimerOptions, setShowSleepTimerOptions] = useState(false);
    const [showCustomTimerInput, setShowCustomTimerInput] = useState(false);
    const [customMinutes, setCustomMinutes] = useState("");

    const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    const clearSleepTimer = useCallback(() => {
        if (sleepTimerRef.current) {
            clearTimeout(sleepTimerRef.current);
            sleepTimerRef.current = null;
        }
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }

        setSleepTimerActive(false);
        setSleepTimerDuration(null);
        setSleepTimerRemaining(0);
        setShowSleepTimerOptions(false);
        setShowCustomTimerInput(false);
        setCustomMinutes("");
    }, []);

    useEffect(() => {
        if (!sleepTimerActive || sleepTimerDuration === null) {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
            setSleepTimerRemaining(0);
            return;
        }

        setSleepTimerRemaining(sleepTimerDuration * 60);

        countdownTimerRef.current = setInterval(() => {
            setSleepTimerRemaining(prev => {
                if (prev <= 1) {
                    if (sound) {
                        sound.pauseAsync();
                    }
                    clearSleepTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000) as unknown as NodeJS.Timeout;

        return () => {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }
        };
    }, [sleepTimerActive, sleepTimerDuration, sound, clearSleepTimer]);

    useEffect(() => {
        if (!sleepTimerActive || sleepTimerDuration === null) {
            if (sleepTimerRef.current) {
                clearTimeout(sleepTimerRef.current);
                sleepTimerRef.current = null;
            }
            return;
        }

        if (sleepTimerRef.current) {
            clearTimeout(sleepTimerRef.current);
        }

        sleepTimerRef.current = setTimeout(() => {
            if (sound) {
                sound.pauseAsync();
            }
            clearSleepTimer();
        }, sleepTimerDuration * 60 * 1000) as unknown as NodeJS.Timeout;

        return () => {
            if (sleepTimerRef.current) {
                clearTimeout(sleepTimerRef.current);
            }
        };
    }, [sleepTimerActive, sleepTimerDuration, sound, clearSleepTimer]);

    const handleSleepPress = useCallback(() => {
        if (sleepTimerActive) {
            clearSleepTimer();
        } else {
            setShowSleepTimerOptions(true);
        }
    }, [sleepTimerActive, clearSleepTimer]);

    const selectSleepTimerDuration = useCallback((minutes: number) => {
        setSleepTimerDuration(minutes);
        setSleepTimerActive(true);
        setShowSleepTimerOptions(false);
        setShowCustomTimerInput(false);
        setSleepTimerRemaining(minutes * 60);
    }, []);

    const submitCustomTimer = useCallback(() => {
        const minutes = parseInt(customMinutes);
        if (minutes > 0 && minutes <= 240) {
            setSleepTimerDuration(minutes);
            setSleepTimerActive(true);
            setShowSleepTimerOptions(false);
            setShowCustomTimerInput(false);
            setCustomMinutes("");
            setSleepTimerRemaining(minutes * 60);
        }
    }, [customMinutes]);

    const formatSleepTimerTime = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return minutes > 0
            ? `${minutes}:${secs.toString().padStart(2, "0")}`
            : `${secs}s`;
    }, []);

    const getSleepTimerButtonText = useCallback(() => {
        if (!sleepTimerActive || sleepTimerRemaining <= 0) {
            return "Sleep timer";
        }
        return formatSleepTimerTime(sleepTimerRemaining);
    }, [sleepTimerActive, sleepTimerRemaining, formatSleepTimerTime]);

    return {
        sleepTimerActive,
        sleepTimerRemaining,
        showSleepTimerOptions,
        showCustomTimerInput,
        customMinutes,
        setCustomMinutes,
        setShowSleepTimerOptions,
        setShowCustomTimerInput,
        handleSleepPress,
        selectSleepTimerDuration,
        submitCustomTimer,
        getSleepTimerButtonText,
        clearSleepTimer,
    };
}
