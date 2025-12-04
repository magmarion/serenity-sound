import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
    Animated,
    Image,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { BatteryCharging, Heart, Moon, Play, Zap, Droplets } from "lucide-react-native";

import Colors from "@/constants/colors";

type MoodCard = {
    id: string;
    title: string;
    description: string;
    gradient: [string, string];
    accent: string;
    icon: React.ComponentType<{ color?: string; size?: number }>;
};

type Session = {
    id: string;
    title: string;
    duration: string;
    moodId: string;
    category: string;
};

const avatarUri = "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80";

const MOOD_CARDS: MoodCard[] = [
    {
        id: "focus",
        title: "Focus",
        description: "Sharpen your mind",
        gradient: ["#3A1C09", "#1B1C37"],
        accent: "#F78A2C",
        icon: Zap,
    },
    {
        id: "calm",
        title: "Calm",
        description: "Reduce stress",
        gradient: ["#1E1B4A", "#1A1034"],
        accent: "#8F7CFF",
        icon: Droplets,
    },
    {
        id: "sleep",
        title: "Sleep",
        description: "Drift off easily",
        gradient: ["#0E1C36", "#081125"],
        accent: "#6DA7FF",
        icon: Moon,
    },
    {
        id: "recharge",
        title: "Recharge",
        description: "Boost energy",
        gradient: ["#0C1F1A", "#05100F"],
        accent: "#4DE2C3",
        icon: BatteryCharging,
    },
];

const CONTINUE_SESSIONS: Session[] = [
    { id: "ocean", title: "Ocean Waves", duration: "45 min · Sleep", moodId: "sleep", category: "Sleep" },
    { id: "wood", title: "Wood Burning", duration: "15 min · Focus", moodId: "focus", category: "Focus" },
    { id: "rain", title: "Heavy Rain", duration: "60 min · Sleep", moodId: "sleep", category: "Sleep" },
    { id: "fire", title: "Cracking Fire", duration: "10 min · Focus", moodId: "focus", category: "Focus" },
];

class HomeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
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

function HomeContent() {
    const heroTilt = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const resetHeroTilt = useCallback(() => {
        Animated.spring(heroTilt, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            speed: 14,
            bounciness: 8,
        }).start();
    }, [heroTilt]);
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                heroTilt.setValue({ x: gestureState.dx * 0.05, y: gestureState.dy * 0.05 });
            },
            onPanResponderRelease: resetHeroTilt,
            onPanResponderTerminate: resetHeroTilt,
        })
    ).current;

    const moodMap = useMemo(() => {
        const entries = new Map<string, MoodCard>();
        MOOD_CARDS.forEach((card) => entries.set(card.id, card));
        return entries;
    }, []);

    const handleMoodPress = useCallback((mood: MoodCard) => {
        console.log(`[HomeScreen] mood tapped: ${mood.title}`);
    }, []);

    const handleSessionPress = useCallback((session: Session) => {
        console.log(`[HomeScreen] session tapped: ${session.title}`);
    }, []);

    useEffect(() => {
        console.log(`[HomeScreen] loaded ${MOOD_CARDS.length} moods`);
        console.log(`[HomeScreen] loaded ${CONTINUE_SESSIONS.length} sessions`);
    }, []);

    return (
        <View style={styles.screen} testID="home-screen">
            <LinearGradient colors={["#0B0F2E", "#05060A"]} style={StyleSheet.absoluteFill} />
            <LinearGradient
                colors={["#312C85", "#0F172B", "#0B0E14"]}
                locations={[0, 0.4, 1]}
                style={styles.topBar}
                testID="home-top-bar"
            >
                <View style={styles.headerRow}>
                    <View style={styles.profileRow}>
                        <Image source={{ uri: avatarUri }} style={styles.avatar} testID="profile-avatar" />
                        <View>
                            <Text style={styles.greetingLabel}>Good evening,</Text>
                            <Text style={styles.greetingName}>John</Text>
                        </View>
                    </View>
                    <View style={styles.heartBadge} testID="favorite-button">
                        <Heart color={Colors.light.text} size={18} />
                    </View>
                </View>
                {/* FIX: Use nested Text component instead of span */}
                <Text style={styles.topPrompt}>How do you want <Text style={styles.titlePrompt}>to feel today?</Text></Text>
            </LinearGradient>
            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View
                    style={[styles.heroCard, heroTilt.getTranslateTransform()]}
                    {...panResponder.panHandlers}
                    testID="hero-card"
                >
                    <LinearGradient colors={["#2F1A5A", "#131A3A"]} style={styles.heroGradient}>
                        <View style={styles.heroContent}>
                            <Text style={styles.heroLabel}>Recommended</Text>
                            <Text style={styles.heroTitle}>Deep Focus</Text>
                            <Text style={styles.heroSubtitle}>Slip into a productive flow with layered ambient tones.</Text>
                            <Pressable
                                onPress={() => console.log("[HomeScreen] play hero recommendation")}
                                style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
                                testID="hero-play-button"
                            >
                                <Play color={Colors.light.text} size={20} />
                                <Text style={styles.playLabel}>Play</Text>
                            </Pressable>
                        </View>
                    </LinearGradient>
                </Animated.View>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Moods</Text>
                </View>
                <View style={styles.moodGrid} testID="mood-grid">
                    {MOOD_CARDS.map((mood) => (
                        <MoodTile key={mood.id} mood={mood} onPress={handleMoodPress} />
                    ))}
                </View>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Continue Listening</Text>
                </View>
                <View style={styles.sessionList} testID="session-list">
                    {CONTINUE_SESSIONS.map((session) => (
                        <SessionRow key={session.id} session={session} mood={moodMap.get(session.moodId)} onPress={handleSessionPress} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

type MoodTileProps = {
    mood: MoodCard;
    onPress: (mood: MoodCard) => void;
};

const MoodTile = React.memo(({ mood, onPress }: MoodTileProps) => {
    const Icon = mood.icon;
    return (
        <Pressable
            onPress={() => onPress(mood)}
            style={({ pressed }) => [styles.moodTile, pressed && styles.moodTilePressed]}
            testID={`mood-${mood.id}`}
        >
            <LinearGradient colors={mood.gradient} style={styles.moodGradient}>
                <View style={styles.moodIconWrap}>
                    <Icon color={mood.accent} size={20} />
                </View>
                <Text style={styles.moodTitle}>{mood.title}</Text>
                <Text style={styles.moodDescription}>{mood.description}</Text>
            </LinearGradient>
        </Pressable>
    );
});

MoodTile.displayName = "MoodTile";

type SessionRowProps = {
    session: Session;
    mood?: MoodCard;
    onPress: (session: Session) => void;
};

const SessionRow = React.memo(({ session, mood, onPress }: SessionRowProps) => (
    <Pressable
        onPress={() => onPress(session)}
        style={({ pressed }) => [styles.sessionRow, pressed && styles.sessionRowPressed]}
        testID={`session-${session.id}`}
    >
        <View style={[styles.sessionIconWrap, { backgroundColor: mood?.gradient[0] ?? Colors.palette.card }]}>
            <Play color={mood?.accent ?? Colors.light.text} size={18} />
        </View>
        <View style={styles.sessionTextBlock}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionMeta}>{session.duration}</Text>
        </View>
        <Heart color={Colors.palette.muted} size={20} />
    </Pressable>
));

SessionRow.displayName = "SessionRow";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.palette.background,
    },
    topBar: {
        paddingTop: 54,
        paddingHorizontal: 20,
        paddingBottom: 24,
        // REMOVED: backgroundColor: "linear-gradient(to bottom, #312C85 0%, #0F172B 40%, #0B0E14 100%)",
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        gap: 16,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 18 },
        elevation: 24,
        zIndex: 2,
    },
    topPrompt: {
        color: Colors.light.text,
        fontSize: 28,
        fontWeight: "800",
        lineHeight: 34,
        maxWidth: 280,
    },
    titlePrompt: {
        color: Colors.palette.accent, // This will make "to feel today?" a different color
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 120,
        gap: 20,
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
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    greetingLabel: {
        color: Colors.palette.muted,
        fontSize: 14,
    },
    greetingName: {
        color: Colors.light.text,
        fontSize: 18,
        fontWeight: "700",
    },
    heartBadge: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    heroCard: {
        borderRadius: 28,
        overflow: "hidden",
    },
    heroGradient: {
        padding: 24,
        borderRadius: 28,
    },
    heroContent: {
        gap: 12,
    },
    heroLabel: {
        color: Colors.palette.muted,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    heroTitle: {
        color: Colors.light.text,
        fontSize: 26,
        fontWeight: "800",
    },
    heroSubtitle: {
        color: Colors.palette.muted,
        fontSize: 15,
        lineHeight: 22,
    },
    playButton: {
        marginTop: 4,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    playButtonPressed: {
        opacity: 0.8,
    },
    playLabel: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: "600",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    sectionTitle: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: "700",
    },
    sectionHint: {
        color: Colors.palette.muted,
        fontSize: 14,
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
    moodTilePressed: {
        transform: [{ scale: 0.98 }],
    },
    moodGradient: {
        padding: 20,
        borderRadius: 24,
        gap: 10,
    },
    moodIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    moodTitle: {
        color: Colors.light.text,
        fontSize: 18,
        fontWeight: "700",
    },
    moodDescription: {
        color: Colors.palette.muted,
        fontSize: 14,
    },
    sessionList: {
        gap: 14,
    },
    sessionRow: {
        backgroundColor: Colors.palette.surface,
        borderRadius: 20,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    sessionRowPressed: {
        opacity: 0.85,
    },
    sessionIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    sessionTextBlock: {
        flex: 1,
    },
    sessionTitle: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: "600",
    },
    sessionMeta: {
        color: Colors.palette.muted,
        marginTop: 4,
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
});