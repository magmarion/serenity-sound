import Colors from "@/constants/colors";
import { fetchSoundEffects } from "@/services/api";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* -------------------------
   Types & Data
-------------------------- */

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
    soundUrl?: string; // Optional
    duration?: number; // Optional  
    artworkUrl?: string; // Optional
};

const avatarUri =
    "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80";

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";



// Using Ionicons from first code structure but with Ionicons names
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

const SESSIONS: Session[] = [
    {
        id: "ocean",
        title: "Ocean Waves",
        durationLabel: "3 min 17 sec • Sleep",
        moodId: "sleep",
        category: "Sleep",
    },
    {
        id: "wood",
        title: "Wood Burning",
        durationLabel: "15 min • Focus",
        moodId: "focus",
        category: "Focus",
    },
    {
        id: "rain",
        title: "Heavy Rain",
        durationLabel: "60 min • Sleep",
        moodId: "sleep",
        category: "Sleep",
    },
    {
        id: "fire",
        title: "Cracking Fire",
        durationLabel: "10 min • Focus",
        moodId: "focus",
        category: "Focus",
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

    const [isFavorite, setFavorites] = useState<Record<string, boolean>>({});
    const [sessions, setSessions] = useState<Session[]>(SESSIONS); // Start with hardcoded
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSessions();
    }, []);

    // Inside your HomeContent component, find the loadSessions function:
    // Fetch sounds for a specific mood
    const loadSessions = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch ALL sounds (no mood filter)
            const fetchedSessions = await fetchSoundEffects();

            if (fetchedSessions.length > 0) {
                setSessions(fetchedSessions);
            } else {
                // Fallback to hardcoded sounds
                setSessions(SESSIONS);
                console.log('Using sample sounds as fallback');
            }
        } catch (err) {
            console.error('Error loading sounds:', err);
            setError('Failed to load sounds');
            setSessions(SESSIONS); // Fallback
        } finally {
            setLoading(false);
        }
    };

    // In your HomeContent component, add this function:
    // Replace the current handleMoodPress function with:
    const handleMoodPress = (moodId: string) => {
        console.log(`Opening category: ${moodId}`);

        // Navigate to category detail page OUTSIDE tabs
        router.push({
            pathname: '/category/[id]',  // ← REMOVED /(tabs)/ prefix
            params: { id: moodId }
        });
    };
    const openPlayerForSession = (session: Session) => {
        // Use default URLs if session doesn't have them
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
    };
    const toggleFavorite = async (sessionId: string) => {
        await Haptics.selectionAsync(); // ← ADD HAPTIC FEEDBACK
        setFavorites(prev => ({
            ...prev,
            [sessionId]: !prev[sessionId]
        }));
    };

    return (
        <View style={styles.container}>
            {/* Background */}
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />

            {/* EXTRA GRADIENT ABOVE HEADER - This extends to top */}
            <LinearGradient
                colors={["#591A1B", "#591A1B"]} // Solid color matching header top
                style={styles.topGradientExtension}
            />

            {/* HEADER - Keep it as is */}
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <LinearGradient
                    colors={["#591A1B", "#0F172B", "#0B0E14"]}
                    locations={[0, 0.4, 1]}
                    style={styles.topBar}
                    testID="home-top-bar"
                >
                    <View style={styles.headerRow}>
                        <View style={styles.profileRow}>
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                            <View>
                                <Text style={styles.greetingLabel}>Good evening,</Text>
                                <Text style={styles.greetingName}>John</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.topPrompt}>
                        How do you want <Text style={styles.titlePrompt}>to feel today?</Text>
                    </Text>
                </LinearGradient>
            </SafeAreaView>

            {/* SCROLL AREA - Content starts below header */}
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

                {/* CONTINUE LISTENING SECTION */}
                <Text style={styles.sectionTitle}>Continue Listening</Text>
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
                            const sessionIsFavorite = isFavorite[session.id] || false; // Check favorite status for THIS session

                            return (
                                <View key={session.id} style={styles.sessionRow}>
                                    {/* Make ONLY the icon pressable */}
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

                                    {/* Heart icon - pressable for favorites */}
                                    <Pressable
                                        onPress={() => toggleFavorite(session.id)}
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.sessionHeartButton,
                                                sessionIsFavorite && styles.sessionHeartButtonFavorited,
                                                // Add pressed state styling directly
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

/* STYLES - EXACTLY THE SAME AS YOUR WORKING CODE */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    /* EXTRA GRADIENT ABOVE HEADER */
    topGradientExtension: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100, // Extends above the header
        zIndex: 1,
    },

    safeArea: {
        zIndex: 2,
    },

    /* HEADER - Keep original positioning */
    topBar: {
        paddingTop: 10, // Original padding
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
        marginTop: 0, // No margin - scroll starts below header
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
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 24,
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
        paddingTop: 20, // Small padding from header
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