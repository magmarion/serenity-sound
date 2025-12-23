// app/(modal)/player.tsx
import Colors from "@/constants/colors";
import { useFavoritesStore } from '@/store/favorites-store';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, Pressable, Text, TextInput, View } from "react-native";
import { playerStyles as styles } from "./styles/player.styles";

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLEEP_TIMER_OPTIONS = [5, 10, 15, 30];

type RepeatMode = 'off' | 'all' | 'one';

type RepeatIcon =
    | { type: 'material'; name: 'repeat-one' }
    | { type: 'ion'; name: 'repeat' | 'repeat-outline' };

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

export default function PlayerSheet() {
    const params = useLocalSearchParams();

    // Extract all session data from params
    const sessionId = (params.id as string) || Date.now().toString();
    const soundUrl = (params.soundUrl as string) || DEFAULT_SOUND_URL;
    const title = (params.title as string) || "Ocean Waves";
    const subtitle = (params.subtitle as string) || "3 min • Waves";
    const artworkUrl = (params.artworkUrl as string) || ART_URL;
    const moodId = (params.moodId as string) || "calm";
    const category = (params.category as string) || "Calm & Nature";

    // Parse playlist from params if available
    const playlistParam = params.playlist as string;
    const initialIndex = params.currentIndex ? parseInt(params.currentIndex as string) : 0;

    // State for playlist navigation
    const [currentPlaylist, setCurrentPlaylist] = useState<Session[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(initialIndex);
    const [shuffledPlaylist, setShuffledPlaylist] = useState<Session[]>([]);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [originalPlaylist, setOriginalPlaylist] = useState<Session[]>([]);

    // Use the favorites store
    const { isFavorite, toggleFavorite } = useFavoritesStore();

    // Create a session object from the params
    const session = useMemo(() => {
        const sessionId = (params.id as string) || Date.now().toString();
        let duration = 180;
        const match = subtitle.match(/(\d+)\s*min/);
        if (match) {
            const minutes = parseInt(match[1]);
            const secondsMatch = subtitle.match(/(\d+)\s*sec/);
            const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
            duration = minutes * 60 + seconds;
        }

        return {
            id: sessionId,
            title: title,
            durationLabel: subtitle,
            moodId: moodId,
            category: category,
            soundUrl: soundUrl,
            artworkUrl: artworkUrl,
            duration: duration
        };
    }, [params.id, title, subtitle, moodId, category, soundUrl, artworkUrl]);

    // Check if this session is already a favorite
    const sessionIsFavorite = isFavorite(sessionId);

    const [isPlaying, setIsPlaying] = useState(true);
    const [sleepTimerActive, setSleepTimerActive] = useState(false);
    const [sleepTimerDuration, setSleepTimerDuration] = useState<number | null>(null);
    const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0);
    const [showSleepTimerOptions, setShowSleepTimerOptions] = useState(false);
    const [showCustomTimerInput, setShowCustomTimerInput] = useState(false);
    const [customMinutes, setCustomMinutes] = useState("");
    const [progress, setProgress] = useState(0);
    const [trackDuration, setTrackDuration] = useState(197);
    const [sliderWidth, setSliderWidth] = useState(0);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    // Refs for timers - using NodeJS.Timeout for Node.js or number for browser
    const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const handleNextTrackRef = useRef<() => Promise<void>>(() => Promise.resolve());

    useEffect(() => {
        const match = subtitle.match(/(\d+)\s*min/);
        if (match) {
            const minutes = parseInt(match[1]);
            const secondsMatch = subtitle.match(/(\d+)\s*sec/);
            const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
            setTrackDuration(minutes * 60 + seconds);
        }
    }, [subtitle]);

    // Setup playlist from params or fetch based on mood
    useEffect(() => {
        const setupPlaylist = async () => {
            try {
                if (playlistParam) {
                    // If playlist was passed as a parameter
                    const parsedPlaylist = JSON.parse(playlistParam);
                    setCurrentPlaylist(parsedPlaylist);
                    setOriginalPlaylist(parsedPlaylist);

                    // Find the current track in the playlist
                    const index = parsedPlaylist.findIndex((track: Session) => track.id === sessionId);
                    if (index !== -1) {
                        setCurrentTrackIndex(index);
                    }
                } else {
                    // Try to fetch playlist based on mood
                    const { fetchSoundEffects } = await import('@/services/api');
                    const playlist = await fetchSoundEffects(moodId);

                    // Find current track index in the playlist
                    const currentIndex = playlist.findIndex(track => track.id === sessionId);

                    // If current track is found in playlist, use that playlist
                    if (currentIndex !== -1) {
                        setCurrentPlaylist(playlist);
                        setOriginalPlaylist(playlist);
                        setCurrentTrackIndex(currentIndex);
                    } else {
                        // If current track not in playlist, create a playlist with just this track
                        const newPlaylist = [session];
                        setCurrentPlaylist(newPlaylist);
                        setOriginalPlaylist(newPlaylist);
                        setCurrentTrackIndex(0);
                    }
                }
            } catch (error) {
                console.error('Error setting up playlist:', error);
                // Fallback: use just the current session
                const newPlaylist = [session];
                setCurrentPlaylist(newPlaylist);
                setOriginalPlaylist(newPlaylist);
                setCurrentTrackIndex(0);
            }
        };

        setupPlaylist();
    }, [playlistParam, sessionId, moodId, session]);

    // Create shuffled playlist when original playlist changes
    useEffect(() => {
        if (originalPlaylist.length > 0) {
            // Create a shuffled copy of the original playlist
            const shuffled = [...originalPlaylist];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setShuffledPlaylist(shuffled);
        }
    }, [originalPlaylist]);

    // Load and manage audio
    useEffect(() => {
        let mounted = true;
        let player: Audio.Sound;

        const loadSound = async () => {
            try {
                console.log("Loading sound from:", soundUrl);

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });

                if (sound) {
                    await sound.unloadAsync();
                }

                const { sound: loadedSound } = await Audio.Sound.createAsync(
                    { uri: soundUrl },
                    { shouldPlay: true }
                );

                if (!mounted) {
                    loadedSound.unloadAsync();
                    return;
                }

                player = loadedSound;
                setSound(player);

                const status = await loadedSound.getStatusAsync();
                if (status.isLoaded && status.durationMillis) {
                    setTrackDuration(status.durationMillis / 1000);
                }

                loadedSound.setOnPlaybackStatusUpdate((status) => {
                    if (!mounted) return;

                    if (status.isLoaded) {
                        setProgress(status.positionMillis / 1000);
                        setIsPlaying(status.isPlaying);

                        if (status.didJustFinish) {
                            // Auto-play next track when current finishes
                            handleNextTrackRef.current?.();
                        }
                    }
                });

            } catch (err) {
                console.error("Error loading sound:", err);
            }
        };

        loadSound();

        return () => {
            mounted = false;
            if (player) {
                player.setOnPlaybackStatusUpdate(null);
                player.unloadAsync();
            }
        };
    }, [soundUrl]);

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

    // Sleep timer countdown
    useEffect(() => {
        if (!sleepTimerActive || sleepTimerDuration === null) {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
            setSleepTimerRemaining(0);
            return;
        }

        // Set initial remaining time
        setSleepTimerRemaining(sleepTimerDuration * 60);

        // Start countdown timer
        countdownTimerRef.current = setInterval(() => {
            setSleepTimerRemaining(prev => {
                if (prev <= 1) {
                    // Time's up - stop audio
                    if (sound) {
                        sound.pauseAsync();
                        setIsPlaying(false);
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

    // Main sleep timer function
    useEffect(() => {
        if (!sleepTimerActive || sleepTimerDuration === null) {
            if (sleepTimerRef.current) {
                clearTimeout(sleepTimerRef.current);
                sleepTimerRef.current = null;
            }
            return;
        }

        // Clear any existing timer
        if (sleepTimerRef.current) {
            clearTimeout(sleepTimerRef.current);
        }

        // Set new timer
        const durationMs = sleepTimerDuration * 60 * 1000;
        sleepTimerRef.current = setTimeout(() => {
            if (sound) {
                sound.pauseAsync();
                setIsPlaying(false);
            }
            clearSleepTimer();
        }, durationMs) as unknown as NodeJS.Timeout;

        return () => {
            if (sleepTimerRef.current) {
                clearTimeout(sleepTimerRef.current);
            }
        };
    }, [sleepTimerActive, sleepTimerDuration, sound, clearSleepTimer]);

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => [SCREEN_HEIGHT * 0.92], []);

    const handleClose = useCallback(() => {
        if (sound) {
            sound.pauseAsync();
        }
        clearSleepTimer();
        router.back();
    }, [sound, clearSleepTimer]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.7}
            />
        ),
        []
    );

    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (trackDuration > 0) {
            Animated.timing(progressAnim, {
                toValue: progress / trackDuration,
                duration: 240,
                useNativeDriver: false,
            }).start();
        }
    }, [progress, trackDuration, progressAnim]);

    useEffect(() => {
        const configureAudioForSilentMode = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });

                console.log('Audio configured for silent mode playback');
            } catch (error) {
                console.error('Audio setup failed:', error);
            }
        };

        configureAudioForSilentMode();
    }, []);

    const handlePlayToggle = useCallback(async () => {
        await Haptics.selectionAsync();
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

    const handleFavorite = useCallback(async () => {
        await Haptics.selectionAsync();
        toggleFavorite(session);
    }, [session, toggleFavorite]);

    const handleSleep = useCallback(async () => {
        await Haptics.selectionAsync();

        if (sleepTimerActive) {
            clearSleepTimer();
        } else {
            setShowSleepTimerOptions(true);
        }
    }, [sleepTimerActive, clearSleepTimer]);

    const selectSleepTimerDuration = useCallback(async (minutes: number) => {
        await Haptics.selectionAsync();

        setSleepTimerDuration(minutes);
        setSleepTimerActive(true);
        setShowSleepTimerOptions(false);
        setShowCustomTimerInput(false);

        // Start countdown immediately
        setSleepTimerRemaining(minutes * 60);
    }, []);

    const handleCustomTimerSubmit = useCallback(async () => {
        await Haptics.selectionAsync();

        const minutes = parseInt(customMinutes);
        if (minutes > 0 && minutes <= 240) { // Max 4 hours
            setSleepTimerDuration(minutes);
            setSleepTimerActive(true);
            setShowSleepTimerOptions(false);
            setShowCustomTimerInput(false);
            setCustomMinutes("");

            setSleepTimerRemaining(minutes * 60);
        }
    }, [customMinutes]);

    const handleScrubFromLocation = useCallback(
        (locationX: number) => {
            if (!sound || sliderWidth <= 0 || trackDuration <= 0) return;

            const ratio = Math.max(0, Math.min(locationX / sliderWidth, 1));
            const newPosition = ratio * trackDuration * 1000;
            sound.setPositionAsync(newPosition);
            setProgress(ratio * trackDuration);
        },
        [sliderWidth, sound, trackDuration]
    );

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onPanResponderGrant: (evt) => handleScrubFromLocation(evt.nativeEvent.locationX),
                onPanResponderMove: (evt) => handleScrubFromLocation(evt.nativeEvent.locationX),
            }),
        [handleScrubFromLocation]
    );

    const progressPercentage = useMemo(() => {
        if (sliderWidth <= 0 || trackDuration <= 0) return 0;
        return (progress / trackDuration) * sliderWidth;
    }, [progress, sliderWidth, trackDuration]);

    const handleShuffle = useCallback(async () => {
        await Haptics.selectionAsync();

        if (originalPlaylist.length <= 1) return;

        setIsShuffled(prev => !prev);
    }, [originalPlaylist.length]);

    // Handle repeat toggle
    const handleRepeat = useCallback(async () => {
        await Haptics.selectionAsync();

        if (repeatMode === 'off') {
            setRepeatMode('all');
        } else if (repeatMode === 'all') {
            setRepeatMode('one');
        } else {
            setRepeatMode('off');
        }
    }, [repeatMode]);

    // Get the active playlist based on shuffle state
    const activePlaylist = useMemo(() => {
        return isShuffled ? shuffledPlaylist : originalPlaylist;
    }, [isShuffled, shuffledPlaylist, originalPlaylist]);

    const handleNextTrack = useCallback(async () => {
        await Haptics.selectionAsync();

        if (activePlaylist.length === 0) return;

        // Handle repeat one mode
        if (repeatMode === 'one') {
            // Restart current track
            if (sound) {
                await sound.setPositionAsync(0);
                setProgress(0);
                await sound.playAsync();
            }
            return;
        }

        // Calculate next track index
        let nextIndex = currentTrackIndex + 1;

        // Handle end of playlist
        if (nextIndex >= activePlaylist.length) {
            if (repeatMode === 'all') {
                // Loop back to beginning
                nextIndex = 0;
            } else {
                // Stop playback at the end
                if (sound) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                }
                return;
            }
        }

        // Don't navigate if it's the same track (only one in playlist)
        if (nextIndex === currentTrackIndex && activePlaylist.length > 1) {
            return;
        }

        const nextTrack = activePlaylist[nextIndex];

        // Stop current playback
        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
        }

        router.setParams({
            id: nextTrack.id,
            title: nextTrack.title,
            subtitle: nextTrack.durationLabel,
            soundUrl: nextTrack.soundUrl,
            artworkUrl: nextTrack.artworkUrl || ART_URL,
            moodId: nextTrack.moodId,
            category: nextTrack.category,
            ...(playlistParam && { playlist: playlistParam }),
            ...(playlistParam && { currentIndex: nextIndex.toString() }),
        });

        setCurrentTrackIndex(nextIndex);
    }, [activePlaylist, currentTrackIndex, sound, playlistParam, repeatMode]);

    const handlePreviousTrack = useCallback(async () => {
        await Haptics.selectionAsync();

        if (activePlaylist.length === 0) return;

        // Calculate previous track index
        let prevIndex = currentTrackIndex - 1;

        // Handle beginning of playlist
        if (prevIndex < 0) {
            if (repeatMode === 'all') {
                // Loop to the end
                prevIndex = activePlaylist.length - 1;
            } else {
                // Go to beginning of current track
                if (sound) {
                    await sound.setPositionAsync(0);
                    setProgress(0);
                }
                return;
            }
        }

        const prevTrack = activePlaylist[prevIndex];

        // Stop current playback
        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
        }

        router.setParams({
            id: prevTrack.id,
            title: prevTrack.title,
            subtitle: prevTrack.durationLabel,
            soundUrl: prevTrack.soundUrl,
            artworkUrl: prevTrack.artworkUrl || ART_URL,
            moodId: prevTrack.moodId,
            category: prevTrack.category,
            ...(playlistParam && { playlist: playlistParam }),
            ...(playlistParam && { currentIndex: prevIndex.toString() }),
        });

        setCurrentTrackIndex(prevIndex);
    }, [activePlaylist, currentTrackIndex, sound, playlistParam, repeatMode]);

    // Update the next track handler ref
    useEffect(() => {
        handleNextTrackRef.current = handleNextTrack;
    }, [handleNextTrack]);

    const handleSkipBack = useCallback(async () => {
        if (!sound) return;

        // If we're more than 3 seconds into the track, go to beginning
        // Otherwise, go to previous track
        if (progress > 3) {
            // Skip to beginning of current track
            await sound.setPositionAsync(0);
            setProgress(0);
        } else {
            // Go to previous track
            await handlePreviousTrack();
        }
    }, [progress, sound, handlePreviousTrack]);

    const handleSkipForward = useCallback(async () => {
        // Go to next track
        await handleNextTrack();
    }, [handleNextTrack]);

    // Format time for sleep timer display
    const formatSleepTimerTime = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (minutes > 0) {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
        return `${secs}s`;
    }, []);

    // Get sleep timer button text based on state
    const getSleepTimerButtonText = useCallback(() => {
        if (!sleepTimerActive || sleepTimerRemaining <= 0) {
            return "Sleep timer";
        }
        return formatSleepTimerTime(sleepTimerRemaining);
    }, [sleepTimerActive, sleepTimerRemaining, formatSleepTimerTime]);

    const getRepeatIcon = useMemo<RepeatIcon>(() => {
        if (repeatMode === 'one') {
            return { type: 'material', name: 'repeat-one' };
        }

        if (repeatMode === 'all') {
            return { type: 'ion', name: 'repeat' };
        }

        return { type: 'ion', name: 'repeat-outline' };
    }, [repeatMode]);

    const getRepeatColor = useMemo(() => {
        switch (repeatMode) {
            case 'all':
                return Colors.light.accent;
            case 'one':
                return Colors.light.accent;
            default:
                return Colors.light.tabIconDefault;
        }
    }, [repeatMode]);

    // Get shuffle button color based on state
    const getShuffleColor = useMemo(() => {
        return isShuffled ? Colors.light.accent : Colors.light.tabIconDefault;
    }, [isShuffled]);

    return (
        <View style={styles.container}>
            <BottomSheet
                ref={sheetRef}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose
                onClose={handleClose}
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.background}
                handleComponent={null} // ← Hide default handle
            >
                <BottomSheetView style={styles.sheetContent}>
                    <LinearGradient
                        colors={["#03040A", Colors.light.background]}
                        style={styles.gradient}
                    >
                        <View style={styles.contentContainer}>
                            {/* CUSTOM HANDLE - Added here */}
                            <View style={styles.customHandle}>
                                <View style={styles.handleIndicator} />
                            </View>

                            <View style={styles.content}>
                                <View style={styles.header}>
                                    <Text style={styles.title}>{title}</Text>
                                    <Text style={styles.subtitle}>{subtitle}</Text>
                                </View>

                                <View style={styles.artContainer}>
                                    <View style={styles.artWrapper}>
                                        <Image source={artworkUrl} style={styles.art} contentFit="cover" />
                                    </View>
                                </View>

                                {/* Track position indicator */}
                                <View style={styles.trackPosition}>
                                    <Text style={styles.trackPositionText}>
                                        {activePlaylist.length > 0 ? `${currentTrackIndex + 1}/${activePlaylist.length}` : '1/1'}
                                    </Text>
                                </View>

                                {/* Sleep Timer Options Modal */}
                                {showSleepTimerOptions && !showCustomTimerInput && (
                                    <View style={styles.sleepTimerModal}>
                                        <View style={styles.sleepTimerOptions}>
                                            <Text style={styles.sleepTimerTitle}>Sleep Timer</Text>
                                            <Text style={styles.sleepTimerSubtitle}>Stop playback after:</Text>

                                            <View style={styles.sleepTimerButtons}>
                                                {SLEEP_TIMER_OPTIONS.map((minutes) => (
                                                    <Pressable
                                                        key={minutes}
                                                        onPress={() => selectSleepTimerDuration(minutes)}
                                                        accessibilityRole="button"
                                                        accessibilityLabel={`Set sleep timer for ${minutes} minutes`}
                                                        style={({ pressed }) => [
                                                            styles.sleepTimerOption,
                                                            pressed && styles.sleepTimerOptionPressed
                                                        ]}
                                                    >
                                                        <Text style={styles.sleepTimerOptionText}>
                                                            {minutes} min
                                                        </Text>
                                                    </Pressable>
                                                ))}
                                            </View>

                                            {/* Custom Timer and Cancel buttons in same row */}
                                            <View style={styles.sleepTimerBottomRow}>
                                                <Pressable
                                                    onPress={() => setShowCustomTimerInput(true)}
                                                    accessibilityRole="button"
                                                    style={({ pressed }) => [
                                                        styles.sleepTimerOption,
                                                        styles.sleepTimerCustomOption,
                                                        pressed && styles.sleepTimerOptionPressed
                                                    ]}
                                                >
                                                    <View style={[styles.sleepTimerCustomText]}>
                                                        <Ionicons name="add" size={20} color={Colors.light.accent} style={{ marginRight: 8 }} />
                                                        <Text style={[styles.sleepTimerOptionText]}>
                                                            Custom
                                                        </Text>
                                                    </View>
                                                </Pressable>

                                                <Pressable
                                                    onPress={() => setShowSleepTimerOptions(false)}
                                                    style={styles.sleepTimerCancelRight}
                                                    accessibilityRole="button"
                                                    accessibilityLabel="Cancel sleep timer"
                                                >
                                                    <Text style={styles.sleepTimerCancelText}>Cancel</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {/* Custom Timer Input Modal */}
                                {showCustomTimerInput && (
                                    <View style={styles.sleepTimerModal}>
                                        <View style={styles.sleepTimerOptions}>

                                            <View style={styles.customTimerInputContainer}>
                                                <TextInput
                                                    style={styles.customTimerInput}
                                                    value={customMinutes}
                                                    onChangeText={setCustomMinutes}
                                                    accessibilityLabel="Custom sleep timer duration"
                                                    accessibilityHint="Enter number of minutes"
                                                    placeholder="00"
                                                    placeholderTextColor="rgba(59, 130, 246, 0.5)"
                                                    keyboardType="number-pad"
                                                    maxLength={3}
                                                    autoFocus
                                                    selectionColor={Colors.light.accent}
                                                />
                                            </View>

                                            {/* Add this container to align the buttons properly */}
                                            <View style={styles.customTimerButtonsContainer}>
                                                <Pressable
                                                    onPress={handleCustomTimerSubmit}
                                                    style={({ pressed }) => [
                                                        styles.sleepTimerOption,
                                                        styles.sleepTimerCustomSubmit,
                                                        pressed && styles.sleepTimerOptionPressed,
                                                        (!customMinutes || parseInt(customMinutes) <= 0 || parseInt(customMinutes) > 240) &&
                                                        styles.sleepTimerCustomSubmitDisabled
                                                    ]}
                                                    disabled={!customMinutes || parseInt(customMinutes) <= 0 || parseInt(customMinutes) > 240}
                                                >
                                                    <Text style={styles.sleepTimerOptionText}>
                                                        Set Timer
                                                    </Text>
                                                </Pressable>

                                                <Pressable
                                                    onPress={() => setShowCustomTimerInput(false)}
                                                >
                                                    <Text style={styles.sleepTimerCancelText}>Back</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.progressSection}>
                                    <View
                                        style={styles.progressTrack}
                                        onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                                        {...panResponder.panHandlers}
                                    >
                                        <Animated.View style={[styles.progressFill, { width: progressPercentage }]} />
                                        <Animated.View
                                            style={[
                                                styles.progressThumb,
                                                { transform: [{ translateX: progressPercentage }] },
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.progressLabels}>
                                        <Text style={styles.progressText}>{formatTime(progress)}</Text>
                                        <Text style={styles.progressText}>{formatTime(trackDuration)}</Text>
                                    </View>
                                </View>

                                <View style={styles.controlsRow}>
                                    {/* Repeat Button */}
                                    <Pressable
                                        onPress={handleRepeat}
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            repeatMode === "off"
                                                ? "Enable repeat all"
                                                : repeatMode === "all"
                                                    ? "Enable repeat one"
                                                    : "Disable repeat"
                                        }
                                        accessibilityState={{ selected: repeatMode !== "off" }}
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.iconButton,
                                                pressed && styles.iconButtonPressed
                                            ]}>
                                                {getRepeatIcon.type === 'material' ? (
                                                    <MaterialIcons
                                                        name={getRepeatIcon.name}
                                                        size={24}
                                                        color={getRepeatColor}
                                                    />
                                                ) : (
                                                    <Ionicons
                                                        name={getRepeatIcon.name}
                                                        size={24}
                                                        color={getRepeatColor}
                                                    />
                                                )}

                                                <Text
                                                    style={[
                                                        styles.iconLabel,
                                                        repeatMode !== 'off' && { color: Colors.light.accent }
                                                    ]}
                                                >
                                                    Repeat
                                                </Text>
                                            </View>
                                        )}
                                    </Pressable>

                                    <Pressable
                                        onPress={handleSkipBack}
                                        accessibilityRole="button"
                                        accessibilityLabel="Previous track"
                                        accessibilityHint="Plays the previous sound"
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.skipButton,
                                                pressed && styles.skipButtonPressed
                                            ]}>
                                                <Ionicons name="play-skip-back" color={Colors.light.text} size={28} />
                                            </View>
                                        )}
                                    </Pressable>

                                    <Pressable
                                        onPress={handlePlayToggle}
                                        accessibilityRole="button"
                                        accessibilityLabel={isPlaying ? "Pause playback" : "Play audio"}
                                        accessibilityHint="Controls audio playback"
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.playButton,
                                                pressed && styles.playButtonPressed
                                            ]}>
                                                {isPlaying ? (
                                                    <Ionicons name="pause" color={Colors.light.surface} size={32} />
                                                ) : (
                                                    <Ionicons name="play" color={Colors.light.surface} size={32} />
                                                )}
                                            </View>
                                        )}
                                    </Pressable>

                                    <Pressable
                                        onPress={handleSkipForward}
                                        accessibilityRole="button"
                                        accessibilityLabel="Next track"
                                        accessibilityHint="Plays the next sound"
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.skipButton,
                                                pressed && styles.skipButtonPressed
                                            ]}>
                                                <Ionicons name="play-skip-forward" color={Colors.light.text} size={28} />
                                            </View>
                                        )}
                                    </Pressable>

                                    {/* Shuffle Button - NOW FUNCTIONAL */}
                                    <Pressable
                                        onPress={handleShuffle}
                                        accessibilityRole="button"
                                        accessibilityLabel={isShuffled ? "Disable shuffle" : "Enable shuffle"}
                                        accessibilityState={{ selected: isShuffled }}
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.iconButton,
                                                pressed && styles.iconButtonPressed
                                            ]}>
                                                <Ionicons
                                                    name={isShuffled ? "shuffle" : "shuffle-outline"}
                                                    color={getShuffleColor}
                                                    size={24}
                                                />
                                                <Text style={[
                                                    styles.iconLabel,
                                                    isShuffled && { color: Colors.light.accent }
                                                ]}>
                                                    Shuffle
                                                </Text>
                                            </View>
                                        )}
                                    </Pressable>
                                </View>

                                <View style={styles.actionRow}>
                                    {/* Add to Favorites Button */}
                                    <Pressable
                                        onPress={handleFavorite}
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            sessionIsFavorite
                                                ? "Remove from favorites"
                                                : "Add to favorites"
                                        }
                                        accessibilityState={{ selected: sessionIsFavorite }}
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.actionButton,
                                                styles.actionButtonFavorite,
                                                pressed && styles.actionButtonPressed,
                                                sessionIsFavorite && styles.actionButtonActive
                                            ]}>
                                                <Ionicons
                                                    name={sessionIsFavorite ? "heart" : "heart-outline"}
                                                    color={sessionIsFavorite ? Colors.light.favorited2 : Colors.light.text}
                                                    size={18}
                                                />
                                                <Text style={[
                                                    styles.actionLabel,
                                                    sessionIsFavorite && styles.actionLabelActive
                                                ]}>
                                                    {sessionIsFavorite ? "Favorited" : "Favorite"}
                                                </Text>
                                            </View>
                                        )}
                                    </Pressable>

                                    {/* Sleep Timer Button - NOW SHOWS COUNTDOWN INSIDE */}
                                    <Pressable
                                        onPress={handleSleep}
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            sleepTimerActive
                                                ? `Sleep timer active, ${getSleepTimerButtonText()} remaining`
                                                : "Set sleep timer"
                                        }
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.actionButton,
                                                styles.actionButtonSleep,
                                                pressed && styles.actionButtonPressed,
                                                sleepTimerActive && styles.actionButtonActive
                                            ]}>
                                                <Ionicons
                                                    name={sleepTimerActive ? "time" : "time-outline"}
                                                    color={sleepTimerActive ? Colors.light.accent : Colors.light.text}
                                                    size={18}
                                                />
                                                <Text style={[
                                                    styles.actionLabel,
                                                    sleepTimerActive && styles.actionLabelActive
                                                ]}>
                                                    {getSleepTimerButtonText()}
                                                </Text>
                                                {sleepTimerActive && sleepTimerRemaining > 0 && (
                                                    <Ionicons
                                                        name="close-circle"
                                                        color={Colors.light.tabIconDefault}
                                                        size={16}
                                                        style={styles.sleepTimerCancelIcon}
                                                    />
                                                )}
                                            </View>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}`;
}