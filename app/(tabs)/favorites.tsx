// app/(tabs)/favorites.tsx - FULL FILE with original styling
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavoritesStore } from '@/store/favoritesStore';
import { router } from 'expo-router';

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

// Helper function to get the icon and gradient based on session data
const getSessionConfig = (session: any) => {
    // Try to match with common sound types
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

type RowProps = {
    session: any;
    onToggleFavorite: (session: any) => void;
    onPlay: (session: any) => void;
};

const FavoriteRow = memo(function FavoriteRow({
    session,
    onToggleFavorite,
    onPlay,
}: RowProps) {
    const [isPressed, setIsPressed] = useState(false);
    
    const config = getSessionConfig(session);
    const IconComponent = (config.iconSet === 'Feather' ? Feather : Ionicons) as React.ComponentType<any>;

    const onPressPlay = useCallback(() => {
        onPlay(session);
    }, [session, onPlay]);

    const onPressHeart = useCallback(() => {
        onToggleFavorite(session);
    }, [session, onToggleFavorite]);

    return (
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
                    <View style={[
                        styles.playContainer,
                        isPressed && { transform: [{ scale: 0.9 }] }
                    ]}>
                        <Pressable
                            testID={`favorites.play.${session.id}`}
                            accessibilityRole="button"
                            onPress={onPressPlay}
                            onPressIn={() => setIsPressed(true)}
                            onPressOut={() => setIsPressed(false)}
                            style={styles.playButton}
                        >
                            <Text style={styles.playText}>Play</Text>
                        </Pressable>
                    </View>

                    <Pressable
                        testID={`favorites.heart.${session.id}`}
                        accessibilityRole="button"
                        onPress={onPressHeart}
                        hitSlop={10}
                        style={({ pressed }) => [
                            styles.heartBtn,
                            pressed ? { transform: [{ scale: 0.96 }], opacity: 0.85 } : null,
                        ]}
                    >
                        <Ionicons
                            name="heart"
                            size={20}
                            color="#FFFFFF"
                        />
                    </Pressable>
                </View>
            </View>
        </LinearGradient>
    );
});

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
        <View style={styles.screen}>
            {/* Background - Same as Settings */}
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Favorites</Text>
                    <Text style={styles.headerSubtitle}>
                        Your most loved sounds in one place
                    </Text>
                </View>

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
                        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <FavoriteRow
                                session={item}
                                onToggleFavorite={onToggleFavorite}
                                onPlay={onPlay}
                            />
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    // Simple fixed header - similar to Settings but with subtitle
    header: {
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: "center",
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 6,
        textAlign: "center",
    },
    headerSubtitle: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 13,
        fontWeight: "500",
        textAlign: "left",
        letterSpacing: 0.3,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        borderRadius: 16,
        overflow: "hidden",
    },
    cardInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flexShrink: 1,
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
        flexShrink: 1,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    playButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playContainer: {
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(255, 255,255, 0.1)",
        height: 36,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 70,
    },
    playText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 13,
        letterSpacing: 0.2,
        textAlign: "center",
    },
    heartBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
});