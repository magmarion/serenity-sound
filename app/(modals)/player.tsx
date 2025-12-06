// app/(modals)/player.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable, Animated as RNAnimated, Image as RNImage } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Clock3, Heart, Maximize2, Pause, Play, Repeat2, SkipBack, SkipForward } from "lucide-react-native";
import Colors from "@/constants/colors";

const TRACK_DURATION = 45 * 60;
const ART_URL =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

export default function PlayerSheet() {
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [sleepTimer, setSleepTimer] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(120);
    const [sliderWidth, setSliderWidth] = useState<number>(0);

    // simple RN animated value for progress thumb (keeps your original behaviour)
    const progressAnim = useRef(new RNAnimated.Value(progress / TRACK_DURATION)).current;

    React.useEffect(() => {
        RNAnimated.timing(progressAnim, {
            toValue: progress / TRACK_DURATION,
            duration: 240,
            useNativeDriver: false,
        }).start();
    }, [progress, progressAnim]);

    React.useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setProgress((prev) => {
                const nextValue = Math.min(prev + 1, TRACK_DURATION);
                if (nextValue === TRACK_DURATION) setIsPlaying(false);
                return nextValue;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const formattedProgress = useMemo(() => formatTime(progress), [progress]);
    const formattedDuration = useMemo(() => formatTime(TRACK_DURATION), []);

    const handlePlayToggle = useCallback(async () => {
        await Haptics.selectionAsync();
        setIsPlaying((p) => !p);
    }, []);

    const handleFavorite = useCallback(async () => {
        await Haptics.selectionAsync();
        setIsFavorite((p) => !p);
    }, []);

    const handleSleep = useCallback(async () => {
        await Haptics.selectionAsync();
        setSleepTimer((p) => !p);
    }, []);

    // BottomSheet ref + snap points
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["90%"], []);

    // close handler (used when sheet dismissed)
    const onClose = useCallback(() => {
        // navigate back (expo-router)
        router.back();
    }, []);

    // Scrub handler (keeps original logic)
    const handleScrubFromLocation = useCallback(
        (locationX: number) => {
            if (sliderWidth <= 0) return;
            const clampedX = Math.max(0, Math.min(locationX, sliderWidth));
            const ratio = clampedX / sliderWidth;
            const nextProgress = Math.round(ratio * TRACK_DURATION);
            setProgress(nextProgress);
        },
        [sliderWidth]
    );

    // pan responder for progress track - simple, kept from your original implementation
    const panResponder = React.useMemo(
        () =>
        // use RN PanResponder if you want - bottom sheet will still handle drag down
        ({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt: any) => handleScrubFromLocation(evt.nativeEvent.locationX),
            onPanResponderMove: (evt: any) => handleScrubFromLocation(evt.nativeEvent.locationX),
            onPanResponderRelease: () => { },
        } as any),
        [handleScrubFromLocation]
    );

    const progressPercent = `${Math.min(100, (progress / TRACK_DURATION) * 100)}%`;

    return (
        // BottomSheet handles overlay and pan-down-to-close
        <BottomSheet
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={onClose}
            backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />}
            handleIndicatorStyle={styles.handleIndicator}
        >
            {/* The sheet's content */}
            <LinearGradient colors={["#03040A", Colors.light.background]} style={styles.gradient}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.topSpacer} />
                    <View style={styles.content}>
                        <Text style={styles.tagline}>Soundscape</Text>
                        <Text style={styles.title}>Ocean Waves</Text>
                        <Text style={styles.subtitle}>45 min • Deep Focus Session</Text>

                        <View style={styles.artWrapper}>
                            <RNImage source={{ uri: ART_URL }} style={styles.art} />
                        </View>

                        <View style={styles.progressSection}>
                            <View
                                style={styles.progressTrack}
                                onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                                // attach pan handlers - your bottom sheet still supports drag-down independently
                                {...(panResponder as any)}
                                testID="player-progress-track"
                            >
                                <View style={[styles.progressFill, { width: progressPercent }]} />
                                <RNAnimated.View
                                    style={[
                                        styles.progressThumb,
                                        {
                                            transform: [
                                                {
                                                    translateX: RNAnimated.multiply(progressAnim, sliderWidth || 0),
                                                },
                                            ],
                                        },
                                    ]}
                                />
                            </View>

                            <View style={styles.progressLabels}>
                                <Text style={styles.progressText}>{formattedProgress}</Text>
                                <Text style={styles.progressText}>{formattedDuration}</Text>
                            </View>
                        </View>

                        <View style={styles.controlsRow}>
                            <IconButton
                                icon={<Repeat2 color={Colors.light.tabIconDefault} size={24} />}
                                onPress={() => console.log("[Player] loop pressed")}
                            />
                            <IconButton icon={<SkipBack color={Colors.light.text} size={28} />} onPress={() => console.log("[Player] skip back")} />
                            <Pressable
                                style={({ pressed }) => [styles.playButton, pressed && { transform: [{ scale: 0.96 }] }]}
                                onPress={handlePlayToggle}
                            >
                                {isPlaying ? <Pause color={Colors.light.surface} size={32} /> : <Play color={Colors.light.surface} size={32} />}
                            </Pressable>
                            <IconButton icon={<SkipForward color={Colors.light.text} size={28} />} onPress={() => console.log("[Player] skip forward")} />
                            <IconButton icon={<Maximize2 color={Colors.light.tabIconDefault} size={24} />} onPress={() => console.log("[Player] expand")} />
                        </View>

                        <View style={styles.actionRow}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.actionButton,
                                    pressed && { transform: [{ scale: 0.97 }] },
                                    isFavorite && { borderColor: Colors.light.tint },
                                ]}
                                onPress={handleFavorite}
                            >
                                <Heart color={isFavorite ? Colors.light.tint : Colors.light.text} />
                                <Text style={styles.actionLabel}>Add to favorites</Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.actionButton,
                                    pressed && { transform: [{ scale: 0.97 }] },
                                    sleepTimer && { borderColor: Colors.light.tint },
                                ]}
                                onPress={handleSleep}
                            >
                                <Clock3 color={sleepTimer ? Colors.light.tint : Colors.light.text} />
                                <Text style={styles.actionLabel}>Sleep timer</Text>
                            </Pressable>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </BottomSheet>
    );
}

/* Helper component kept simple */
const IconButton = ({ icon, onPress }: { icon: React.ReactNode; onPress: () => void }) => (
    <Pressable style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]} onPress={onPress}>
        {icon}
    </Pressable>
);

/* utils */
function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

/* styles - kept from your original file with tiny tweaks for bottom sheet */
const styles = StyleSheet.create({
    gradient: { flex: 1 },
    safeArea: { flex: 1 },
    topSpacer: { height: 12 },
    content: { flex: 1, paddingHorizontal: 24, gap: 20 },
    tagline: { color: Colors.light.tabIconDefault, letterSpacing: 2, textTransform: "uppercase", fontSize: 12 },
    title: { fontSize: 34, color: Colors.light.text, fontWeight: "700" },
    subtitle: { fontSize: 16, color: Colors.light.tabIconDefault },
    artWrapper: {
        borderRadius: 40,
        padding: 12,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: "center",
    },
    art: { width: "100%", aspectRatio: 1, borderRadius: 32 },
    progressSection: { gap: 12 },
    progressTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: Colors.light.border,
        overflow: "hidden",
        justifyContent: "center",
    },
    progressFill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: Colors.light.tint },
    progressThumb: { position: "absolute", width: 16, height: 16, borderRadius: 16, backgroundColor: Colors.light.tint, top: -4 },
    progressLabels: { flexDirection: "row", justifyContent: "space-between" },
    progressText: { color: Colors.light.tabIconDefault, fontSize: 14 },
    controlsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    playButton: {
        width: 88,
        height: 88,
        borderRadius: 54,
        backgroundColor: Colors.light.tint,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Colors.light.tint,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 18,
        elevation: 8,
    },
    iconButton: { alignItems: "center", gap: 6 },
    actionRow: { flexDirection: "row", gap: 16 },
    actionButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 999,
        paddingVertical: 16,
        backgroundColor: Colors.light.surface,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    actionLabel: { color: Colors.light.text, fontSize: 15, fontWeight: "600" },
    handleIndicator: { backgroundColor: "rgba(255,255,255,0.12)" },
});
