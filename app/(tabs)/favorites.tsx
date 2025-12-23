// app/(tabs)/favorites.tsx
import { useFavoritesStore } from '@/store/favorites-store';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import React, { memo, useCallback, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView, } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming, } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";
import { favoritesStyles as styles } from './styles/favorites.styles';

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

// Swipeable row component
const SwipeableRow = memo(function SwipeableRow({
    session,
    onToggleFavorite,
    onPlay,
}: {
    session: any;
    onToggleFavorite: (session: any) => void;
    onPlay: (session: any) => void;
}) {
    const [isPressed, setIsPressed] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const translateX = useSharedValue(0);
    const deleteWidth = useSharedValue(0);

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const rowHeight = useSharedValue(68);

    const config = getSessionConfig(session);
    const IconComponent = (config.iconSet === 'Feather' ? Feather : Ionicons) as React.ComponentType<any>;

    const onPressPlay = useCallback(() => {
        onPlay(session);
    }, [session, onPlay]);

    const handleDelete = useCallback(() => {
        // Store the function to call on JS thread
        const deleteOnJS = () => {
            onToggleFavorite(session);
        };

        // Start animations
        translateX.value = withTiming(-200, { duration: 400 });
        scale.value = withTiming(0.8, { duration: 400 });
        opacity.value = withTiming(0, { duration: 400 });
        rowHeight.value = withTiming(0, { duration: 400 });

        // Call JS function after animation
        setTimeout(() => {
            deleteOnJS();
        }, 400);
    }, [session, onToggleFavorite, translateX, scale, opacity, rowHeight]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            // Only allow left swipe (negative values)
            if (event.translationX < 0) {
                translateX.value = Math.max(event.translationX, -100);
                // Expand delete width as user swipes
                deleteWidth.value = Math.min(Math.abs(event.translationX), 100);
            }
        })
        .onEnd((event) => {
            if (event.translationX < -60) {
                // Swiped past threshold - show confirmation modal
                translateX.value = withSpring(-100);
                deleteWidth.value = 100;
                runOnJS(Haptics.selectionAsync)();
                runOnJS(setShowDeleteConfirm)(true);
            } else {
                // Return to original position
                translateX.value = withSpring(0);
                deleteWidth.value = withSpring(0);
            }
        });

    const animatedRowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { scale: scale.value }],
        opacity: opacity.value,
        height: rowHeight.value,
        marginVertical: rowHeight.value === 0 ? 0 : 3.5,
    }));

    const deleteBackgroundStyle = useAnimatedStyle(() => ({
        width: deleteWidth.value,
        opacity: deleteWidth.value > 0 ? 1 : 0,
    }));

    const handleCancelDelete = useCallback(() => {
        setShowDeleteConfirm(false);
        translateX.value = withSpring(0);
        deleteWidth.value = withSpring(0);
    }, [translateX, deleteWidth]);

    const handleConfirmDelete = useCallback(() => {
        setShowDeleteConfirm(false);
        handleDelete();
    }, [handleDelete]);

    return (
        <View style={styles.swipeableContainer}>
            {/* Red delete background that expands as you swipe */}
            <Animated.View style={[styles.deleteBackground, deleteBackgroundStyle]}>
                <View style={styles.deleteContent}>
                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.deleteText}>Delete</Text>
                </View>
            </Animated.View>

            {/* The actual swipable card */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={animatedRowStyle}
                    accessibilityLabel={`Favorite sound ${session.title}`}
                >
                    <LinearGradient
                        colors={config.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.card}
                    >
                        <View style={styles.cardInner}>
                            <View style={styles.left}>
                                <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
                                    <IconComponent name={config.iconName} size={18} color="#FFFFFF" />
                                </View>
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {session.title}
                                </Text>
                            </View>

                            <View style={styles.actions}>
                                {/* Original play button style */}
                                <View style={[
                                    styles.playContainer,
                                    isPressed && { transform: [{ scale: 0.9 }] }
                                ]}>
                                    <Pressable
                                        testID={`favorites.play.${session.id}`}
                                        onPress={onPressPlay}
                                        onPressIn={() => setIsPressed(true)}
                                        onPressOut={() => setIsPressed(false)}
                                        style={styles.playButton}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Play ${session.title}`}
                                        accessibilityHint="Opens the sound player"
                                    >
                                        <Text style={styles.playText}>Play</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </GestureDetector>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteConfirm}
                transparent
                animationType="fade"
                onRequestClose={handleCancelDelete}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmationBox}>
                        <View style={styles.confirmationIcon}>
                            <Ionicons name="trash" size={40} color="#FF3B30" />
                        </View>
                        <Text style={styles.confirmationTitle}>Remove from Favorites</Text>
                        <Text style={styles.confirmationMessage}>
                            Are you sure you want to remove &#39;{session.title}&#39; from your favorites?
                        </Text>
                        <View style={styles.confirmationButtons}>
                            <Pressable
                                onPress={handleCancelDelete}
                                style={[styles.confirmationButton, styles.cancelButton]}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel removal"
                                accessibilityHint="Closes the confirmation dialog"
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleConfirmDelete}
                                style={[styles.confirmationButton, styles.deleteButton]}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove ${session.title} from favorites`}
                                accessibilityHint="Removes the sound from your favorites"
                            >
                                <Text style={styles.deleteButtonText}>Remove</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
});

function useHaptics() {
    return useCallback(async (type: "light" | "success") => {
        try {
            if (type === "success") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                return;
            }
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {
            console.log("Haptics failed (safe to ignore):", e);
        }
    }, []);
}

// Helper function to get the icon and gradient based on session data
const getSessionConfig = (session: any) => {
    const title = session.title?.toLowerCase() || '';
    const moodId = session.moodId?.toLowerCase() || '';

    if (title.includes('rain') || title.includes('rainy')) {
        return {
            gradient: ["#2B3442", "#121720"] as const,
            iconName: "rainy" as const,
            iconSet: "Ionicons" as const,
            iconBg: "rgba(255,255,255,0.12)"
        };
    }
    if (title.includes('fire') || title.includes('fireplace')) {
        return {
            gradient: ["#F26B1D", "#C43C07"] as const,
            iconName: "flame" as const,
            iconSet: "Ionicons" as const,
            iconBg: "rgba(255,255,255,0.16)"
        };
    }
    if (title.includes('forest') || title.includes('woods')) {
        return {
            gradient: ["#1B8C7A", "#0F5B4F"] as const,
            iconName: "leaf" as const,
            iconSet: "Ionicons" as const,
            iconBg: "rgba(255,255,255,0.14)"
        };
    }
    if (title.includes('thunder') || title.includes('storm')) {
        return {
            gradient: ["#2A63FF", "#1236A7"] as const,
            iconName: "thunderstorm" as const,
            iconSet: "Ionicons" as const,
            iconBg: "rgba(255,255,255,0.16)"
        };
    }
    if (title.includes('ocean') || title.includes('sea')) {
        return {
            gradient: ["#2B3442", "#131A23"] as const,
            iconName: "water" as const,
            iconSet: "Ionicons" as const,
            iconBg: "rgba(255,255,255,0.12)"
        };
    }
    if (title.includes('wind') || title.includes('breeze')) {
        return {
            gradient: ["#2B3442", "#141A23"] as const,
            iconName: "wind" as const,
            iconSet: "Feather" as const,
            iconBg: "rgba(255,255,255,0.16)"
        };
    }
    if (title.includes('meditation') || title.includes('relax')) {
        return {
            gradient: ["#2A63FF", "#163DBA"] as const,
            iconName: "moon" as const,
            iconSet: "Ionicons" as const,
            iconBg: "rgba(255,255,255,0.16)"
        };
    }
    if (title.includes('water') || title.includes('stream')) {
        return {
            gradient: ["#17B69C", "#0B6E60"] as const,
            iconName: "water" as const,
            iconSet: "Ionicons" as const,
            iconBg: "rgba(255,255,255,0.14)"
        };
    }
    if (title.includes('white noise') || title.includes('static')) {
        return {
            gradient: ["#2B3442", "#141A23"] as const,
            iconName: "radio" as const,
            iconSet: "Feather" as const,
            iconBg: "rgba(255,255,255,0.12)"
        };
    }
    if (title.includes('campfire') || title.includes('bonfire')) {
        return {
            gradient: ["#F26B1D", "#B62F0A"] as const,
            iconName: "bonfire" as const,
            iconSet: "Ionicons" as const,
            iconBg: "rgba(255,255,255,0.16)"
        };
    }

    // Fallback based on moodId
    switch (moodId) {
        case 'focus':
            return {
                gradient: ["#3A1C09", "#1B1C37"] as const,
                iconName: "flash" as const,
                iconSet: "Ionicons" as const,
                iconBg: "rgba(255,255,255,0.12)"
            };
        case 'calm':
            return {
                gradient: ["#1E1B4A", "#1A1034"] as const,
                iconName: "water" as const,
                iconSet: "Ionicons" as const,
                iconBg: "rgba(255,255,255,0.12)"
            };
        case 'sleep':
            return {
                gradient: ["#0E1C36", "#081125"] as const,
                iconName: "moon" as const,
                iconSet: "Ionicons" as const,
                iconBg: "rgba(255,255,255,0.12)"
            };
        case 'recharge':
            return {
                gradient: ["#0C1F1A", "#05100F"] as const,
                iconName: "battery-charging" as const,
                iconSet: "Ionicons" as const,
                iconBg: "rgba(255,255,255,0.12)"
            };
        default:
            return {
                gradient: ["#2B3442", "#121720"] as const,
                iconName: "musical-notes" as const,
                iconSet: "Ionicons" as const,
                iconBg: "rgba(255,255,255,0.12)"
            };
    }
};

export default function FavoritesScreen() {
    const { favorites, removeFavorite } = useFavoritesStore();
    const haptics = useHaptics();

    const onToggleFavorite = useCallback(
        async (session: any) => {
            await haptics("light");
            removeFavorite(session.id);
        },
        [haptics, removeFavorite]
    );

    const onPlay = useCallback(
        async (session: any) => {
            await haptics("success");

            const soundUrl = session.soundUrl || DEFAULT_SOUND_URL;
            const artworkUrl = session.artworkUrl || ART_URL;

            router.push({
                pathname: '/(modal)/player',
                params: {
                    id: session.id,
                    soundUrl: soundUrl,
                    title: session.title || 'Sound',
                    subtitle: session.durationLabel || '3 min • Ambient',
                    artworkUrl: artworkUrl,
                },
            });
        },
        [haptics]
    );

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Background */}
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />

            {/* EXTRA GRADIENT ABOVE HEADER - matching home screen */}
            <LinearGradient
                colors={["#591A1B", "#591A1B"]}
                style={styles.topGradientExtension}
            />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* HEADER - matching home screen style */}
                <LinearGradient
                    colors={["#591A1B", "#0F172B", "#0B0E14"]}
                    locations={[0, 0.4, 1]}
                    style={styles.topBar}
                >
                    <View style={styles.headerRow}>
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>Favorites</Text>
                            <Text style={styles.headerSubtitle}>
                                Your most loved sounds in one place
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* SCROLL AREA */}
                <View style={styles.scrollArea}>
                    {favorites.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="heart-outline" size={64} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyTitle}>No favorites yet</Text>
                            <Text style={styles.emptyText}>
                                Tap the heart icon on any sound to add it here
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            testID="favorites.list"
                            data={favorites}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            accessibilityRole="list"
                            renderItem={({ item }) => (
                                <SwipeableRow
                                    session={item}
                                    onToggleFavorite={onToggleFavorite}
                                    onPlay={onPlay}
                                />
                            )}
                        />
                    )}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}