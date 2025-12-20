// app/(modal)/player.tsx
import { useFavoritesStore } from '@/store/favoritesStore';
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Audio } from "expo-av";
import Colors from "@/constants/colors";

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Sleep timer options in minutes
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

   // Use the favorites store
   const { isFavorite, toggleFavorite } = useFavoritesStore();

   // Create a session object from the params
   const session = useMemo(() => {
      // Parse duration from subtitle
      let duration = 180; // default 3 minutes
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
   }, [sessionId, title, subtitle, moodId, category, soundUrl, artworkUrl]);

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

   useEffect(() => {
      const match = subtitle.match(/(\d+)\s*min/);
      if (match) {
         const minutes = parseInt(match[1]);
         const secondsMatch = subtitle.match(/(\d+)\s*sec/);
         const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
         setTrackDuration(minutes * 60 + seconds);
      }
   }, [subtitle]);

   // Load and manage audio
   useEffect(() => {
      let mounted = true;
      let player: Audio.Sound;

      const loadSound = async () => {
         try {
            console.log("Loading sound from:", soundUrl);

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
                     loadedSound.setPositionAsync(0);
                     loadedSound.pauseAsync();
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
      // Use the favorites store instead of local state
      toggleFavorite(session);
   }, [session, toggleFavorite]);

   const handleSleep = useCallback(async () => {
      await Haptics.selectionAsync();

      if (sleepTimerActive) {
         // If timer is active, turn it off
         clearSleepTimer();
      } else {
         // If timer is not active, show options
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

         // Start countdown immediately
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

   const handleSkipBack = useCallback(async () => {
      if (!sound) return;
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
         const newPosition = Math.max(0, status.positionMillis - 10000);
         sound.setPositionAsync(newPosition);
      }
   }, [sound]);

   const handleSkipForward = useCallback(async () => {
      if (!sound) return;
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
         const newPosition = Math.min(
            trackDuration * 1000,
            status.positionMillis + 10000
         );
         sound.setPositionAsync(newPosition);
      }
   }, [sound, trackDuration]);

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
                                       placeholder="22"
                                       placeholderTextColor="rgba(59, 130, 246, 0.5)"
                                       keyboardType="number-pad"
                                       maxLength={3}
                                       autoFocus
                                       selectionColor={Colors.light.accent}
                                    />
                                    <Text style={styles.customTimerLabel}>minutes</Text>
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
                           <Pressable onPress={() => { }}>
                              {({ pressed }) => (
                                 <View style={[
                                    styles.iconButton,
                                    pressed && styles.iconButtonPressed
                                 ]}>
                                    <Ionicons name="repeat" color={Colors.light.tabIconDefault} size={24} />
                                    <Text style={styles.iconLabel}>Repeat</Text>
                                 </View>
                              )}
                           </Pressable>

                           <Pressable onPress={handleSkipBack}>
                              {({ pressed }) => (
                                 <View style={[
                                    styles.skipButton,
                                    pressed && styles.skipButtonPressed
                                 ]}>
                                    <Ionicons name="play-skip-back" color={Colors.light.text} size={28} />
                                 </View>
                              )}
                           </Pressable>

                           <Pressable onPress={handlePlayToggle}>
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

                           <Pressable onPress={handleSkipForward}>
                              {({ pressed }) => (
                                 <View style={[
                                    styles.skipButton,
                                    pressed && styles.skipButtonPressed
                                 ]}>
                                    <Ionicons name="play-skip-forward" color={Colors.light.text} size={28} />
                                 </View>
                              )}
                           </Pressable>

                           <Pressable onPress={() => { }}>
                              {({ pressed }) => (
                                 <View style={[
                                    styles.iconButton,
                                    pressed && styles.iconButtonPressed
                                 ]}>
                                    <Ionicons name="shuffle" color={Colors.light.tabIconDefault} size={24} />
                                    <Text style={styles.iconLabel}>Shuffle</Text>
                                 </View>
                              )}
                           </Pressable>
                        </View>

                        <View style={styles.actionRow}>
                           {/* Add to Favorites Button - NOW CONNECTED TO FAVORITES STORE */}
                           <Pressable onPress={handleFavorite}>
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
                                       {sessionIsFavorite ? "Remove favorite" : "Add to favorites"}
                                    </Text>
                                 </View>
                              )}
                           </Pressable>

                           {/* Sleep Timer Button - NOW SHOWS COUNTDOWN INSIDE */}
                           <Pressable onPress={handleSleep}>
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
   contentContainer: {
      flex: 1,
      paddingBottom: 34,
   },
   content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "space-between",
      paddingBottom: 40,
   },
   header: {
      alignItems: "center",
      marginTop: 10,
      marginBottom: 20,
   },
   title: {
      fontSize: 30,
      color: Colors.light.text,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 4,
   },
   subtitle: {
      fontSize: 16,
      color: Colors.light.tabIconDefault,
      textAlign: "center",
   },
   artContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      maxHeight: 300,
      marginVertical: 20,
   },
   artWrapper: {
      borderRadius: 32,
      padding: 10,
      backgroundColor: Colors.light.surface,
      borderWidth: 1,
      borderColor: Colors.light.border,
      width: "105%",
      aspectRatio: 1.4,
   },
   art: {
      width: "100%",
      height: "100%",
      borderRadius: 26,
   },
   progressSection: {
      marginVertical: 24,
      gap: 8,
   },
   progressTrack: {
      height: 6,
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
      backgroundColor: Colors.light.accent,
   },
   progressThumb: {
      position: "absolute",
      width: 16,
      height: 16,
      borderRadius: 16,
      backgroundColor: Colors.light.accent,
      top: -5,
      left: -8,
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
      marginVertical: 24,
   },
   iconButton: {
      alignItems: "center",
      gap: 4,
      padding: 8,
      minWidth: 50,
   },
   iconButtonPressed: {
      opacity: 0.6,
   },
   iconLabel: {
      fontSize: 11,
      color: Colors.light.tabIconDefault,
      marginTop: 2,
   },
   skipButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 44,
   },
   skipButtonPressed: {
      opacity: 0.6,
   },
   playButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: Colors.light.accent,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: Colors.light.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
   },
   playButtonPressed: {
      transform: [{ scale: 0.96 }],
   },
   actionRow: {
      flexDirection: "row",
      gap: 16,
      marginTop: 20,
      justifyContent: 'center',
   },
   actionButton: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 24,
      paddingVertical: 18,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
   },
   actionButtonFavorite: {
      width: 180,
   },
   actionButtonSleep: {
      width: 180,
   },
   actionButtonPressed: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
   },
   actionButtonActive: {
      borderColor: Colors.light.accent,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
   },
   actionLabel: {
      color: Colors.light.text,
      fontSize: 15,
      fontWeight: "500",
   },
   actionLabelActive: {
      color: Colors.light.accent,
   },
   customHandle: {
      width: '100%',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 8,
   },
   handleIndicator: {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      width: 60,
      height: 4,
      borderRadius: 2,
   },
   sleepTimerModal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
   },
   sleepTimerOptions: {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      borderRadius: 24,
      padding: 24,
      width: "80%",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.12)",
   },
   sleepTimerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: Colors.light.text,
      marginBottom: 24,
      opacity: 0.8,
   },
   sleepTimerSubtitle: {
      fontSize: 16,
      color: Colors.light.tabIconDefault,
      marginBottom: 24,
      opacity: 0.8,
   },
   sleepTimerButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 20,
   },
   sleepTimerOption: {
      backgroundColor: Colors.light.accent,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      minWidth: 100,
      alignItems: 'center',
   },
   sleepTimerCustomOption: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      flexDirection: 'row',
      alignItems: 'center',
   },
   sleepTimerCustomSubmit: {
      minWidth: 150,
   },
   sleepTimerCustomSubmitDisabled: {
      opacity: 0.5,
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
   },
   sleepTimerOptionPressed: {
      opacity: 0.8,
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
   },
   sleepTimerOptionText: {
      color: Colors.light.accent,
      fontSize: 16,
      fontWeight: '600',
      opacity: 0.9,
   },
   sleepTimerCustomText: {
      color: Colors.light.text,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
   },
   sleepTimerCancelRight: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 34,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
   },
   sleepTimerCancelText: {
      color: Colors.light.tabIconDefault,
      fontSize: 16,
      fontWeight: '600',
      opacity: 0.9,
   },
   sleepTimerCancelIcon: {
      marginLeft: 4,
   },
   sleepTimerBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: 20,
   },
   customTimerButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 46,
      width: '100%',
   },
   customTimerInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      gap: 12,
   },
   customTimerInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 20,
      color: Colors.light.accent,
      fontSize: 32,
      fontWeight: '400',
      textAlign: 'center',
      minWidth: 100,
      opacity: 0.9,
   },
   customTimerLabel: {
      color: Colors.light.tabIconDefault,
      fontSize: 18,
      opacity: 0.8,
   },
});