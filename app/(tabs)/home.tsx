// app/(tabs)/index.tsx
import { Avatar } from "@/components/Avatar";
import Colors from "@/constants/colors";
import { fetchSoundEffects, Session } from "@/services/api";
import { toast } from "@/services/toast";
import { useAuthStore } from "@/store/auth-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { homeStyles as styles } from '@/styles/tabs/home.styles';
import { createPlaylist, findSessionIndex } from "@/utils/playlistHelper";
import { Fontisto, Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

type MoodCard = {
    id: string;
    title: string;
    description: string;
    gradient: [string, string];
    accent: string;
    icon: keyof typeof Ionicons.glyphMap;
};

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
    const { user, profile } = useAuthStore();

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
        const soundUrl = session.soundUrl;
        const artworkUrl = session.artworkUrl;

        // Create playlist from all sessions
        const playlist = createPlaylist(sessions);

        // Find session index in the playlist
        const currentIndex = findSessionIndex(playlist, session.id);

        // If session not found in playlist (shouldn't happen but just in case)
        if (currentIndex === -1) {
            console.warn(`Session ${session.id} not found in playlist, using default`);
            router.push({
                pathname: '/(modal)/player',
                params: {
                    id: session.id,
                    moodId: session.moodId,
                    category: session.category,
                    soundUrl: soundUrl || DEFAULT_SOUND_URL,
                    title: session.title || 'Sound',
                    subtitle: session.durationLabel || '3 min • Ambient',
                    artworkUrl: artworkUrl || ART_URL,
                },
            });
            return;
        }

        console.log(`Opening player: ${session.title}, index: ${currentIndex + 1}/${playlist.length}`);

        router.push({
            pathname: '/(modal)/player',
            params: {
                id: session.id,
                moodId: session.moodId,
                category: session.category,
                soundUrl: soundUrl || DEFAULT_SOUND_URL,
                title: session.title || 'Sound',
                subtitle: session.durationLabel || '3 min • Ambient',
                artworkUrl: artworkUrl || ART_URL,
                playlist: JSON.stringify(playlist),
                currentIndex: currentIndex.toString(),
            },
        });
    };

    const handleToggleFavorite = async (session: Session) => {
        await Haptics.selectionAsync();

        const result = await toggleFavorite(session);

        if (result === "added") {
            toast("Added to favorites");
        }

        if (result === "removed") {
            toast("Removed from favorites");
        }
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
                colors={["#0B0A2A", "#05060A"]}
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
                            accessibilityRole="button"
                            accessibilityLabel="Open profile"
                            accessibilityHint="Navigates to your profile screen"

                        >
                            <Avatar
                                size={52}
                                onPress={() => router.push('/(modal)/profile')}
                                borderWidth={1}
                                borderColor="rgba(255,255,255,0.15)"
                                fallbackType="gradient"
                                borderRadius={20}
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
                            accessibilityRole="button"
                            accessibilityLabel={`${mood.title} mood`}
                            accessibilityHint={`Opens ${mood.title.toLowerCase()} category`}

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
                        <Pressable onPress={loadSessions} style={styles.retryButton}
                            accessibilityRole="button"
                            accessibilityLabel="Retry loading sounds"
                            accessibilityHint="Attempts to load sounds again"
                        >
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
                                        accessibilityRole="button"
                                        accessibilityLabel={`Play ${session.title}`}
                                        accessibilityHint="Opens the sound player"
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
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            sessionIsFavorite
                                                ? `Remove ${session.title} from favorites`
                                                : `Add ${session.title} to favorites`
                                        }
                                        accessibilityHint="Toggles favorite status"
                                        accessibilityState={{ selected: sessionIsFavorite }}
                                    >
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.sessionFavoriteButton,
                                                sessionIsFavorite && styles.sessionFavoriteButtonFavorited,
                                                pressed && { transform: [{ scale: 0.9 }], opacity: 0.8 }
                                            ]}>
                                                <Fontisto
                                                    name={sessionIsFavorite ? "favorite" : "favorite"}
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