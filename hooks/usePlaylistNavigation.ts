import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import Colors from "@/constants/colors";

type RepeatMode = "off" | "all" | "one";

interface Session {
    id: string;
    title: string;
    durationLabel: string;
    duration: number;
    moodId: string;
    category: string;
    soundUrl: string;
    artworkUrl?: string;
}

export function usePlaylistNavigation(
    initialIndex: number,
    sessionId: string,
    playlistParam: string | undefined,
    moodId: string,
    session: Session,
    sound: any
) {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(initialIndex);
    const [originalPlaylist, setOriginalPlaylist] = useState<Session[]>([]);
    const [shuffledPlaylist, setShuffledPlaylist] = useState<Session[]>([]);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

    const handleNextTrackRef = useRef<() => Promise<void>>(() => Promise.resolve());

    useEffect(() => {
        const setupPlaylist = async () => {
            try {
                if (playlistParam) {
                    const parsed = JSON.parse(playlistParam);
                    setOriginalPlaylist(parsed);
                    const index = parsed.findIndex((t: Session) => t.id === sessionId);
                    if (index !== -1) setCurrentTrackIndex(index);
                } else {
                    const { fetchSoundEffects } = await import("@/services/api");
                    const playlist = await fetchSoundEffects(moodId);
                    const index = playlist.findIndex(t => t.id === sessionId);
                    if (index !== -1) {
                        setOriginalPlaylist(playlist);
                        setCurrentTrackIndex(index);
                    } else {
                        setOriginalPlaylist([session]);
                        setCurrentTrackIndex(0);
                    }
                }
            } catch {
                setOriginalPlaylist([session]);
                setCurrentTrackIndex(0);
            }
        };

        setupPlaylist();
    }, [playlistParam, sessionId, moodId, session]);

    useEffect(() => {
        if (!originalPlaylist.length) return;

        const shuffled = [...originalPlaylist];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setShuffledPlaylist(shuffled);
    }, [originalPlaylist]);

    const activePlaylist = useMemo(
        () => (isShuffled ? shuffledPlaylist : originalPlaylist),
        [isShuffled, shuffledPlaylist, originalPlaylist]
    );

    const handleShuffle = useCallback(() => {
        if (originalPlaylist.length > 1) {
            setIsShuffled(prev => !prev);
        }
    }, [originalPlaylist.length]);

    const handleRepeat = useCallback(() => {
        setRepeatMode(prev =>
            prev === "off" ? "all" : prev === "all" ? "one" : "off"
        );
    }, []);

    const handleNextTrack = useCallback(async () => {
        if (!activePlaylist.length) return;

        if (repeatMode === "one" && sound) {
            await sound.setPositionAsync(0);
            await sound.playAsync();
            return;
        }

        let nextIndex = currentTrackIndex + 1;

        if (nextIndex >= activePlaylist.length) {
            if (repeatMode === "all") nextIndex = 0;
            else return;
        }

        const next = activePlaylist[nextIndex];

        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
        }

        router.setParams({
            id: next.id,
            title: next.title,
            subtitle: next.durationLabel,
            soundUrl: next.soundUrl,
            artworkUrl: next.artworkUrl,
            moodId: next.moodId,
            category: next.category,
            ...(playlistParam && { playlist: playlistParam }),
            ...(playlistParam && { currentIndex: nextIndex.toString() }),
        });

        setCurrentTrackIndex(nextIndex);
    }, [activePlaylist, currentTrackIndex, repeatMode, sound, playlistParam]);

    useEffect(() => {
        handleNextTrackRef.current = handleNextTrack;
    }, [handleNextTrack]);

    const handlePreviousTrack = useCallback(async () => {
        if (!activePlaylist.length) return;

        let prevIndex = currentTrackIndex - 1;

        if (prevIndex < 0) {
            if (repeatMode === "all") prevIndex = activePlaylist.length - 1;
            else if (sound) {
                await sound.setPositionAsync(0);
                return;
            }
        }

        const prev = activePlaylist[prevIndex];

        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
        }

        router.setParams({
            id: prev.id,
            title: prev.title,
            subtitle: prev.durationLabel,
            soundUrl: prev.soundUrl,
            artworkUrl: prev.artworkUrl,
            moodId: prev.moodId,
            category: prev.category,
            ...(playlistParam && { playlist: playlistParam }),
            ...(playlistParam && { currentIndex: prevIndex.toString() }),
        });

        setCurrentTrackIndex(prevIndex);
    }, [activePlaylist, currentTrackIndex, repeatMode, sound, playlistParam]);

    const handleSkipBack = useCallback(async (progress: number) => {
        if (!sound) return;
        if (progress > 3) {
            await sound.setPositionAsync(0);
        } else {
            await handlePreviousTrack();
        }
    }, [sound, handlePreviousTrack]);

    const getRepeatIcon = useMemo(() => {
        if (repeatMode === "one") {
            return { type: "material", name: "repeat-one" } as const;
        }
        if (repeatMode === "all") {
            return { type: "ion", name: "repeat" } as const;
        }
        return { type: "ion", name: "repeat-outline" } as const;
    }, [repeatMode]);

    const getRepeatColor = useMemo(
        () =>
            repeatMode === "off"
                ? Colors.light.tabIconDefault
                : Colors.light.accent,
        [repeatMode]
    );

    const getShuffleColor = useMemo(
        () => (isShuffled ? Colors.light.accent : Colors.light.tabIconDefault),
        [isShuffled]
    );

    return {
        activePlaylist,
        currentTrackIndex,
        repeatMode,
        isShuffled,
        handleShuffle,
        handleRepeat,
        handleNextTrack,
        handlePreviousTrack,
        handleSkipBack,
        getRepeatIcon,
        getRepeatColor,
        getShuffleColor,
    };
}
