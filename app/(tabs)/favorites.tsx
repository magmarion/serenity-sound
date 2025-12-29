// app/(tabs)/favorites.tsx
import { SwipeableFavoriteRow } from '@/components/favorites/SwipeableFavoriteRow';
import { useFavoritesStore } from '@/store/favorites-store';
import { favoritesStyles as styles } from '@/styles/tabs/favorites.styles';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";
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
                    playlist: JSON.stringify(favorites),
                    currentIndex: favorites.findIndex(item => item.id === session.id).toString(),
                },
            });

        },
        [favorites]
    );

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Background */}
            <LinearGradient
                colors={["#0B0A2A", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />
            <LinearGradient
                colors={["#591A1B", "#591A1B"]}
                style={styles.topGradientExtension}
            />
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
                                <SwipeableFavoriteRow
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