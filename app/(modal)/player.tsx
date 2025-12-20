// app/(modal)/player.tsx
import Colors from "@/constants/colors";
import { useFavoritesStore } from '@/store/favoritesStore';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { playerStyles as styles } from "./styles/player.styles";

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

   useEffect(() => {
      const configureAudioForSilentMode = async () => {
         try {
            // ONLY configure audio for silent mode - no background tasks
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