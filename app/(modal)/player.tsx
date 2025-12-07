import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import {
  Clock3,
  Heart,
  Maximize2,
  Pause,
  Play,
  Repeat2,
  SkipBack,
  SkipForward,
} from "lucide-react-native";

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

  // BottomSheet ref
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["100%"], []);

  // Close handler
  const handleClose = useCallback(() => {
    router.back();
  }, []);

  // Backdrop component
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

  // Original progress animation
  const progressAnim = useRef(new Animated.Value(progress / TRACK_DURATION)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress / TRACK_DURATION,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    console.log("[Player] playback state", { isPlaying });
    if (!isPlaying) {
      return undefined;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextValue = Math.min(prev + 1, TRACK_DURATION);
        if (nextValue === TRACK_DURATION) {
          console.log("[Player] track reached end, auto-pausing");
          setIsPlaying(false);
        }
        return nextValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const formattedProgress = useMemo(() => formatTime(progress), [progress]);
  const formattedDuration = useMemo(() => formatTime(TRACK_DURATION), []);

  const handlePlayToggle = useCallback(async () => {
    await Haptics.selectionAsync();
    setIsPlaying((prev) => {
      const next = !prev;
      console.log("[Player] toggled play", { next });
      return next;
    });
  }, []);

  const handleFavorite = useCallback(async () => {
    await Haptics.selectionAsync();
    setIsFavorite((prev) => {
      const next = !prev;
      console.log("[Player] favorite toggled", { next });
      return next;
    });
  }, []);

  const handleSleep = useCallback(async () => {
    await Haptics.selectionAsync();
    setSleepTimer((prev) => {
      const next = !prev;
      console.log("[Player] sleep timer toggled", { next });
      return next;
    });
  }, []);

  const handleScrubFromLocation = useCallback(
    (locationX: number) => {
      if (sliderWidth <= 0) {
        return;
      }
      const clampedX = Math.max(0, Math.min(locationX, sliderWidth));
      const ratio = clampedX / sliderWidth;
      const nextProgress = Math.round(ratio * TRACK_DURATION);
      console.log("[Player] scrubbing", { locationX, sliderWidth, ratio });
      setProgress(nextProgress);
    },
    [sliderWidth],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => handleScrubFromLocation(evt.nativeEvent.locationX),
        onPanResponderMove: (evt) => handleScrubFromLocation(evt.nativeEvent.locationX),
        onPanResponderRelease: () => console.log("[Player] scrub complete"),
      }),
    [handleScrubFromLocation],
  );

  const progressPercentage = useMemo(() => {
    const next = Math.min(100, (progress / TRACK_DURATION) * 100);
    return `${next}%` as const;
  }, [progress]);

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleClose}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.background}
      >
        <BottomSheetView style={styles.sheetContent}>
          <LinearGradient
            colors={["#03040A", Colors.light.background]}
            style={styles.gradient}
          >
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.topSpacer} />
              <View style={styles.content}>
                <Text style={styles.title}>Ocean Waves</Text>
                <Text style={styles.subtitle}>45 min • Deep Focus Session</Text>

                <View style={styles.artWrapper}>
                  <Image
                    source={ART_URL}
                    style={styles.art}
                    contentFit="cover"
                    testID="player-artwork"
                  />
                </View>

                <View style={styles.progressSection}>
                  <View
                    style={styles.progressTrack}
                    onLayout={(event) => {
                      setSliderWidth(event.nativeEvent.layout.width);
                    }}
                    {...panResponder.panHandlers}
                    testID="player-progress-track"
                  >
                    <Animated.View
                      style={[styles.progressFill, { width: progressPercentage }]}
                    />
                    <Animated.View
                      style={[
                        styles.progressThumb,
                        {
                          transform: [
                            {
                              translateX: Animated.multiply(
                                progressAnim,
                                sliderWidth || 0,
                              ),
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
                    label="Repeat"
                    onPress={() => console.log("[Player] repeat pressed")}
                    testID="player-repeat"
                  />
                  <IconButton
                    icon={<SkipBack color={Colors.light.text} size={28} />}
                    onPress={() => console.log("[Player] skip back pressed")}
                    testID="player-skip-back"
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.playButton,
                      pressed && { transform: [{ scale: 0.96 }] },
                    ]}
                    onPress={handlePlayToggle}
                    testID="player-play-toggle"
                  >
                    {isPlaying ? (
                      <Pause color={Colors.light.surface} size={32} />
                    ) : (
                      <Play color={Colors.light.surface} size={32} />
                    )}
                  </Pressable>
                  <IconButton
                    icon={<SkipForward color={Colors.light.text} size={28} />}
                    onPress={() => console.log("[Player] skip forward pressed")}
                    testID="player-skip-forward"
                  />
                  <IconButton
                    icon={<Maximize2 color={Colors.light.tabIconDefault} size={24} />}
                    label="Shuffle"
                    onPress={() => console.log("[Player] shuffle pressed")}
                    testID="player-shuffle"
                  />
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && { transform: [{ scale: 0.97 }] },
                      isFavorite && { borderColor: Colors.light.tint },
                    ]}
                    onPress={handleFavorite}
                    testID="player-favorite-button"
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
                    testID="player-sleep-button"
                  >
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

const IconButton = ({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: ReactNode;
  label?: string;
  onPress: () => void;
  testID?: string;
}) => (
  <Pressable
    style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]}
    onPress={onPress}
    testID={testID}
  >
    {icon}
    {label ? <Text style={styles.iconLabel}>{label}</Text> : null}
  </Pressable>
);

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
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
  tagline: {
    color: Colors.light.tabIconDefault,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
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
        marginTop: 8, // Added margin to push progress section higher

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