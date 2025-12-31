import { ActionButtons } from "@/components/player/ActionButtons";
import { ArtworkSection } from "@/components/player/ArtworkSection";
import { PlaybackControls } from "@/components/player/PlaybackControls";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { ProgressBar } from "@/components/player/ProgressBar";
import { SleepTimerModal } from "@/components/player/SleepTimerModal";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePlaylistNavigation } from "@/hooks/usePlaylistNavigation";
import { useSleepTimer } from "@/hooks/useSleepTimer";
import { useFavoritesStore } from '@/store/favorites-store';
import { playerStyles as styles } from "@/styles/modal/player.styles";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, Text, View } from "react-native";


const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

    // State for the slider
    const [sliderWidth, setSliderWidth] = useState(0);

    const onTrackEndRef = useRef<(() => void) | null>(null);
    const { sound, isPlaying, progress, trackDuration, togglePlay, } = useAudioPlayer(soundUrl, onTrackEndRef);
    // Use the sleep timer

    // Use the playlist navigation
    const {
        activePlaylist,
        currentTrackIndex,
        repeatMode,
        isShuffled,
        handleShuffle,
        handleRepeat,
        handleNextTrack,
        handleSkipBack,
        getRepeatIcon,
        getRepeatColor,
        getShuffleColor,
    } = usePlaylistNavigation(
        initialIndex,
        sessionId,
        playlistParam,
        moodId,
        session,
        sound
    );

    useEffect(() => {
        onTrackEndRef.current = handleNextTrack;
    }, [handleNextTrack]);

    const {
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
    } = useSleepTimer(sound);
    // Use the audio player

    const isSeekingRef = useRef(false);
    const lastSeekTsRef = useRef(0);

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

    const handlePlayToggle = useCallback(async () => {
        await Haptics.selectionAsync();
        await togglePlay();
    }, [togglePlay]);


    const handleFavorite = useCallback(async () => {
        await Haptics.selectionAsync();
        toggleFavorite(session);
    }, [session, toggleFavorite]);

    const handleSleep = useCallback(async () => {
        await Haptics.selectionAsync();
        handleSleepPress();
    }, [handleSleepPress]);
    
    const handleScrubFromLocation = useCallback(
        async (locationX: number, isFinal = false) => {
            if (!sound || sliderWidth <= 0 || trackDuration <= 0) return;

            const ratio = Math.max(0, Math.min(locationX / sliderWidth, 1));
            const positionMs = ratio * trackDuration * 1000;

            const now = Date.now();

            if (!isFinal) {
                if (now - lastSeekTsRef.current < 80) return;
                lastSeekTsRef.current = now;
            }

            if (isSeekingRef.current) return;
            isSeekingRef.current = true;

            try {
                await sound.setPositionAsync(positionMs);
            } catch (error: any) {
                if (!error?.message?.includes("Seeking interrupted")) {
                    console.error(error);
                }
            } finally {
                isSeekingRef.current = false;
            }
        },
        [sound, sliderWidth, trackDuration]
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
                        colors={["#0B0A2A", "#05060A"]}
                        style={styles.gradient}
                    >
                        <View style={styles.contentContainer}>
                            {/* CUSTOM HANDLE - Added here */}
                            <View style={styles.customHandle}>
                                <View style={styles.handleIndicator} />
                            </View>

                            <View style={styles.content}>
                                <PlayerHeader title={title} subtitle={subtitle} />

                                <ArtworkSection artworkUrl={artworkUrl} />

                                {/* Track position indicator */}
                                <View style={styles.trackPosition}>
                                    <Text style={styles.trackPositionText}>
                                        {activePlaylist.length > 0 ? `${currentTrackIndex + 1}/${activePlaylist.length}` : '1/1'}
                                    </Text>
                                </View>

                                <SleepTimerModal
                                    showOptions={showSleepTimerOptions}
                                    showCustom={showCustomTimerInput}
                                    customMinutes={customMinutes}
                                    onChangeCustomMinutes={setCustomMinutes}
                                    onSelectDuration={selectSleepTimerDuration}
                                    onShowCustom={() => setShowCustomTimerInput(true)}
                                    onHideOptions={() => setShowSleepTimerOptions(false)}
                                    onHideCustom={() => setShowCustomTimerInput(false)}
                                    onSubmitCustom={submitCustomTimer}
                                />

                                <ProgressBar
                                    progress={progress}
                                    duration={trackDuration}
                                    progressPercentage={progressPercentage}
                                    panHandlers={panResponder.panHandlers}
                                    onLayout={setSliderWidth}
                                />

                                <PlaybackControls
                                    isPlaying={isPlaying}
                                    repeatMode={repeatMode}
                                    isShuffled={isShuffled}
                                    repeatIcon={getRepeatIcon}
                                    repeatColor={getRepeatColor}
                                    shuffleColor={getShuffleColor}
                                    onRepeat={handleRepeat}
                                    onSkipBack={() => handleSkipBack(progress)}
                                    onPlayToggle={handlePlayToggle}
                                    onSkipForward={handleNextTrack}
                                    onShuffle={handleShuffle}
                                />
                                <ActionButtons
                                    isFavorite={sessionIsFavorite}
                                    sleepActive={sleepTimerActive}
                                    sleepText={getSleepTimerButtonText()}
                                    sleepRemaining={sleepTimerRemaining}
                                    onFavorite={handleFavorite}
                                    onSleep={handleSleep}
                                />
                            </View>
                        </View>
                    </LinearGradient>
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}