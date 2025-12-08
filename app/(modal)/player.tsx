import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { Clock3, Heart, Maximize2, Pause, Play, Repeat2, SkipBack, SkipForward, } from "lucide-react-native";
import { Audio } from "expo-av";
import Colors from "@/constants/colors";

const TRACK_DURATION = 45 * 60; // sekunder
const ART_URL =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

// Gratis regnljud från freesound.org (CC0 eller royalty-free)
const RAIN_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export default function PlayerSheet() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

const lastRouteRef = useRef<"/" | "/player">("/"); // only allowed routes

  // Load sound from URL
  useEffect(() => {
    let mounted = true;
    let player: Audio.Sound;

    const loadSound = async () => {
      try {
        const { sound: loadedSound, status } = await Audio.Sound.createAsync(
          { uri: RAIN_URL },
          { shouldPlay: false } // start paused
        );

        player = loadedSound;
        if (!mounted) return;

        setSound(player);
        setProgress(0);

        loadedSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setProgress(status.positionMillis / 1000);
            setIsPlaying(status.isPlaying);
          }
        });
      } catch (err) {
        console.error("Error loading sound:", err);
      }
    };

    loadSound();

    return () => {
      mounted = false;
      if (player) player.unloadAsync();
    };
  }, []);


  // BottomSheet
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["100%"], []);

  const handleClose = useCallback(() => {
    router.replace(lastRouteRef.current); // go to last route
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
    ),
    []
  );

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress / TRACK_DURATION,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const handlePlayToggle = useCallback(async () => {
    await Haptics.selectionAsync();
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) {
      console.warn("Sound not loaded yet");
      return;
    }

    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  }, [sound]);


  const handleFavorite = useCallback(async () => {
    await Haptics.selectionAsync();
    setIsFavorite((prev) => !prev);
  }, []);

  const handleSleep = useCallback(async () => {
    await Haptics.selectionAsync();
    setSleepTimer((prev) => !prev);
  }, []);

  const handleScrubFromLocation = useCallback(
    (locationX: number) => {
      if (!sound || sliderWidth <= 0) return;

      const ratio = Math.max(0, Math.min(locationX / sliderWidth, 1));
      sound.setPositionAsync(ratio * TRACK_DURATION * 1000);
    },
    [sliderWidth, sound]
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
    if (sliderWidth <= 0) return 0;
    return (progress / TRACK_DURATION) * sliderWidth;
  }, [progress, sliderWidth]);

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.background}
      >
        <BottomSheetView style={styles.sheetContent}>
          <LinearGradient colors={["#03040A", Colors.light.background]} style={styles.gradient}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.topSpacer} />
              <View style={styles.content}>
                <Text style={styles.title}>Rain Sounds</Text>
                <Text style={styles.subtitle}>45 min • Relaxing Rain</Text>

                <View style={styles.artWrapper}>
                  <Image source={ART_URL} style={styles.art} contentFit="cover" />
                </View>

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
                    <Text style={styles.progressText}>{formatTime(TRACK_DURATION)}</Text>
                  </View>
                </View>

                <View style={styles.controlsRow}>
                  <IconButton icon={<Repeat2 color={Colors.light.tabIconDefault} size={24} />} label="Repeat" onPress={() => { }} />
                  <IconButton icon={<SkipBack color={Colors.light.text} size={28} />} onPress={() => { }} />
                  <Pressable style={({ pressed }) => [styles.playButton, pressed && { transform: [{ scale: 0.96 }] }]} onPress={handlePlayToggle}>
                    {isPlaying ? <Pause color={Colors.light.surface} size={32} /> : <Play color={Colors.light.surface} size={32} />}
                  </Pressable>
                  <IconButton icon={<SkipForward color={Colors.light.text} size={28} />} onPress={() => { }} />
                  <IconButton icon={<Maximize2 color={Colors.light.tabIconDefault} size={24} />} label="Shuffle" onPress={() => { }} />
                </View>

                <View style={styles.actionRow}>
                  <Pressable style={({ pressed }) => [styles.actionButton, pressed && { transform: [{ scale: 0.97 }] }, isFavorite && { borderColor: Colors.light.tint }]} onPress={handleFavorite}>
                    <Heart color={isFavorite ? Colors.light.tint : Colors.light.text} />
                    <Text style={styles.actionLabel}>Add to favorites</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.actionButton, pressed && { transform: [{ scale: 0.97 }] }, sleepTimer && { borderColor: Colors.light.tint }]} onPress={handleSleep}>
                    <Clock3 color={sleepTimer ? Colors.light.tint : Colors.light.text} />
                    <Text style={styles.actionLabel}>Sleep timer</Text>
                  </Pressable>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const IconButton = ({ icon, label, onPress }: { icon: ReactNode; label?: string; onPress: () => void }) => (
  <Pressable style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]} onPress={onPress}>
    {icon}
    {label ? <Text style={styles.iconLabel}>{label}</Text> : null}
  </Pressable>
);

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  background: {
    backgroundColor: "transparent",
  },
  sheetContent: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topSpacer: {
    height: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
  },
  title: {
    fontSize: 34,
    color: Colors.light.text,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
  artWrapper: {
    borderRadius: 40,
    padding: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  art: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 32,
  },
  progressSection: {
    gap: 12,
    marginTop: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.border,
    overflow: "hidden",
    justifyContent: "center",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.light.tint,
  },
  progressThumb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    top: -4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    color: Colors.light.tabIconDefault,
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  iconButton: {
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  iconLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
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
  actionLabel: {
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: "600",
  },
  handleIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
