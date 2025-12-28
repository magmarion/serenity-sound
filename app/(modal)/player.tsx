// app/(modal)/player.tsx
import Colors from "@/constants/colors";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useSleepTimer } from "@/hooks/useSleepTimer";
import { usePlaylistNavigation } from "@/hooks/usePlaylistNavigation";
import { useFavoritesStore } from '@/store/favorites-store';
import { playerStyles as styles } from "@/styles/modal/player.styles";
import { formatTime } from "@/utils/formatTime";
import { Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, Pressable, Text, TextInput, View } from "react-native";


const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLEEP_TIMER_OPTIONS = [5, 10, 15, 30];

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

    // Use the audio player
    const { sound, isPlaying, progress, trackDuration, togglePlay, } = useAudioPlayer(soundUrl);

    // Use the sleep timer
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
        async (locationX: number) => {
            if (!sound || sliderWidth <= 0 || trackDuration <= 0) return;

            const ratio = Math.max(0, Math.min(locationX / sliderWidth, 1));
            const newPosition = ratio * trackDuration * 1000;
            await sound.setPositionAsync(newPosition);
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
                                                    onPress={submitCustomTimer}
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
                                                {getRepeatIcon.type === "material" && (
                                                    <MaterialIcons
                                                        name="repeat-one"
                                                        size={24}
                                                        color={getRepeatColor}
                                                    />
                                                )}

                                                {getRepeatIcon.type === "ion" && (
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
                                        onPress={() => handleSkipBack(progress)}
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
                                        onPress={handleNextTrack}
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
                                                <Fontisto
                                                    name={sessionIsFavorite ? "favorite" : "favorite"}
                                                    color={sessionIsFavorite ? Colors.light.favorited : Colors.light.text}
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