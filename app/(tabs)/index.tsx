// app/(tabs)/index.tsx
import { Avatar } from "@/components/Avatar"; // Add this import
import Colors from "@/constants/colors";
import { fetchSoundEffects } from "@/services/api";
import { useAuthStore } from "@/store/auth-store"; // Add this import
import { useFavoritesStore } from "@/store/favoritesStore";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MoodCard = {
    id: string;
    title: string;
    description: string;
    gradient: [string, string];
    accent: string;
    icon: keyof typeof Ionicons.glyphMap;
};

type Session = {
    id: string;
    title: string;
    durationLabel: string;
    moodId: string;
    category: string;
    soundUrl?: string;
    duration?: number;
    artworkUrl?: string;
};

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

const MOODS: MoodCard[] = [
    {
        id: "focus",
        title: "Focus",
        description: "Sharpen your mind",
        gradient: ["#3A1C09", "#1B1C37"],
        accent: "#F78A2C",
        icon: "flash",
    },
    {
        id: "calm",
        title: "Calm",
        description: "Reduce stress",
        gradient: ["#1E1B4A", "#1A1034"],
        accent: "#8F7CFF",
        icon: "water",
    },
    {
        id: "sleep",
        title: "Sleep",
        description: "Drift off easily",
        gradient: ["#0E1C36", "#081125"],
        accent: "#6DA7FF",
        icon: "moon",
    },
    {
        id: "recharge",
        title: "Recharge",
        description: "Boost energy",
        gradient: ["#0C1F1A", "#05100F"],
        accent: "#4DE2C3",
        icon: "battery-charging",
    },
];

/* ERROR BOUNDARY */
class HomeErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: Error) {
        console.log("[HomeErrorBoundary]", error.message);
    }
    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.errorContainer} testID="home-error">
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorSubtitle}>Please refresh to try again.</Text>
                </View>
            );
        }
        return this.props.children;
    }
}

export default function HomeScreen() {
    return (
        <HomeErrorBoundary>
            <HomeContent />
        </HomeErrorBoundary>
    );
}

/* MAIN CONTENT */
function HomeContent() {
    const moodMap = useMemo(() => {
        const m = new Map<string, MoodCard>();
        MOODS.forEach((card) => m.set(card.id, card));
        return m;
    }, []);

    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { isFavorite, toggleFavorite } = useFavoritesStore();
    const { user, profile, isAuthenticated } = useAuthStore();

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            setError(null);

            const fetchedSessions = await fetchSoundEffects();
            setSessions(fetchedSessions);

        } catch (err) {
            console.error('Error loading sounds:', err);
            setError('Failed to load sounds');
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMoodPress = (moodId: string) => {
        console.log(`Opening category: ${moodId}`);

        router.push({
            pathname: '/category/[id]',
            params: { id: moodId }
        });
    };

    const openPlayerForSession = (session: Session) => {
        const soundUrl = session.soundUrl || DEFAULT_SOUND_URL;
        const artworkUrl = session.artworkUrl || ART_URL;

        router.push({
            pathname: '/(modal)/player',
            params: {
                id: session.id,
                moodId: session.moodId,
                category: session.category,
                soundUrl: soundUrl,
                title: session.title || 'Sound',
                subtitle: session.durationLabel || '3 min • Ambient',
                artworkUrl: artworkUrl,
            },
        });
    };

    const handleToggleFavorite = async (session: Session) => {
        await Haptics.selectionAsync();
        toggleFavorite(session);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const getUserName = () => {
        if (profile?.name) return profile.name;
        if (user?.displayName) return user.displayName;
        if (user?.email) return user.email.split('@')[0];
        return "User";
    };

    return (
        <View style={styles.container}>
            {/* Background */}
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />

            {/* EXTRA GRADIENT ABOVE HEADER */}
            <LinearGradient
                colors={["#591A1B", "#591A1B"]}
                style={styles.topGradientExtension}
            />

            {/* HEADER */}
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <LinearGradient
                    colors={["#591A1B", "#0F172B", "#0B0E14"]}
                    locations={[0, 0.4, 1]}
                    style={styles.topBar}
                    testID="home-top-bar"
                >
                    <View style={styles.headerRow}>
                        <Pressable
                            onPress={() => router.push('/(modal)/profile')}
                            style={styles.profileRow}
                        >
                            <Avatar
                                size={52}
                                onPress={() => router.push('/(modal)/profile')}
                                borderWidth={1}
                                borderColor="rgba(255,255,255,0.15)"
                                fallbackType="gradient"
                                borderRadius="circle"
                                showContainer={false} // No container for home screen
                                testID="home-avatar"
                            />
                            <View>
                                <Text style={styles.greetingLabel}>
                                    {getGreeting()},
                                </Text>
                                <Text style={styles.greetingName}>
                                    {getUserName()}
                                </Text>
                            </View>
                        </Pressable>
                    </View>

                    <Text style={styles.topPrompt}>
                        How do you want <Text style={styles.titlePrompt}>to feel today?</Text>
                    </Text>
                </LinearGradient>
            </SafeAreaView>

            {/* SCROLL AREA */}
            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* MOODS SECTION */}
                <Text style={styles.sectionTitle}>Moods</Text>
                <View style={styles.moodGrid}>
                    {MOODS.map((mood) => (
                        <Pressable
                            key={mood.id}
                            onPress={() => handleMoodPress(mood.id)}
                            style={styles.moodTile}
                        >
                            {({ pressed }) => (
                                <LinearGradient
                                    colors={mood.gradient}
                                    style={[
                                        styles.moodGradient,
                                        pressed && { opacity: 0.9 }
                                    ]}
                                >
                                    <View style={styles.moodIconWrap}>
                                        <Ionicons name={mood.icon} color={mood.accent} size={20} />
                                    </View>
                                    <Text style={styles.moodTitle}>{mood.title}</Text>
                                    <Text style={styles.moodDescription}>
                                        {mood.description}
                                    </Text>
                                </LinearGradient>
                            )}
                        </Pressable>
                    ))}
                </View>

                {/* RECOMMENDED SECTION */}
                <Text style={styles.sectionTitle}>Recommended</Text>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading sounds...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorMessage}>
                        <Text style={styles.errorText}>{error}</Text>
                        <Pressable onPress={loadSessions} style={styles.retryButton}>
                            <Text style={styles.retryText}>Retry</Text>
                        </Pressable>
                    </View>
                ) : sessions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No sounds available</Text>
                    </View>
                ) : (
                    <View style={styles.sessionList}>
                        {sessions.map((session) => {
                            const mood = moodMap.get(session.moodId);
                            const sessionIsFavorite = isFavorite(session.id);

                            return (
                                <View key={session.id} style={styles.sessionRow}>
                                    <Pressable
                                        onPress={() => openPlayerForSession(session)}
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.sessionIconWrap,
                                                { backgroundColor: mood?.gradient[0] ?? Colors.palette.card },
                                                pressed && { opacity: 0.8 }
                                            ]}>
                                                <Ionicons
                                                    name="play"
                                                    color={mood?.accent ?? Colors.light.text}
                                                    size={18}
                                                />
                                            </View>
                                        )}
                                    </Pressable>

                                    <View style={styles.sessionText}>
                                        <Text style={styles.sessionTitle}>{session.title}</Text>
                                        <Text style={styles.sessionMeta}>
                                            {session.durationLabel}
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() => handleToggleFavorite(session)}
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.sessionHeartButton,
                                                sessionIsFavorite && styles.sessionHeartButtonFavorited,
                                                pressed && { transform: [{ scale: 0.9 }], opacity: 0.8 }
                                            ]}>
                                                <Ionicons
                                                    name={sessionIsFavorite ? "heart" : "heart-outline"}
                                                    color={sessionIsFavorite ? Colors.light.favorited : Colors.palette.muted}
                                                    size={24}
                                                />
                                            </View>
                                        )}
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    topGradientExtension: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        zIndex: 1,
    },

    safeArea: {
        zIndex: 2,
    },

    /* HEADER */
    topBar: {
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        gap: 16,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 18 },
        elevation: 24,
    },

    scrollArea: {
        flex: 1,
        marginTop: 0,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    greetingLabel: {
        color: Colors.palette.text,
        fontSize: 14,
    },
    greetingName: {
        color: Colors.light.text,
        fontSize: 18,
        fontWeight: "700",
    },

    topPrompt: {
        color: Colors.light.text,
        fontSize: 28,
        fontWeight: "800",
        lineHeight: 34,
        maxWidth: 280,
    },
    titlePrompt: {
        color: Colors.palette.accent,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        paddingTop: 20,
        gap: 20,
    },

    /* MOODS SECTION */
    sectionTitle: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: "700",
    },
    moodGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 16,
    },
    moodTile: {
        width: "48%",
        borderRadius: 24,
        overflow: "hidden",
    },
    moodGradient: {
        borderRadius: 24,
        padding: 16,
        gap: 8,
    },
    moodIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    moodTitle: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: "700",
    },
    moodDescription: {
        color: Colors.palette.under_text,
        fontSize: 13,
    },

    /* SESSION LIST */
    sessionList: {
        gap: 12,
    },
    sessionRow: {
        backgroundColor: Colors.palette.surface,
        borderRadius: 20,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    sessionIconWrap: {
        width: 60,
        height: 50,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    sessionText: {
        flex: 1,
    },
    sessionTitle: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: "600",
    },
    sessionMeta: {
        color: Colors.palette.muted,
        fontSize: 13,
        marginTop: 2,
    },
    sessionHeartButton: {
        padding: 8,
        marginRight: 4,
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionHeartButtonFavorited: {
        shadowColor: Colors.light.favorited,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 6,
    },

    errorContainer: {
        flex: 1,
        backgroundColor: Colors.palette.background,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    errorTitle: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: "700",
    },
    errorSubtitle: {
        color: Colors.palette.muted,
        marginTop: 8,
        fontSize: 16,
        textAlign: "center",
    },

    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: Colors.palette.muted,
        fontSize: 16,
    },
    errorMessage: {
        padding: 20,
        alignItems: 'center',
        gap: 10,
    },
    errorText: {
        color: Colors.palette.muted,
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.light.accent,
        borderRadius: 8,
    },
    retryText: {
        color: Colors.light.surface,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.palette.muted,
        fontSize: 16,
    },
});