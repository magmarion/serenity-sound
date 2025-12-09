import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Colors from "@/constants/colors";

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
    soundUrl: string;
};

const avatarUri =
    "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80";

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

// Sessions with sound URLs from first code
const SESSIONS: Session[] = [
    {
        id: "rain-hero",
        title: "Rain Sounds",
        durationLabel: "45 min • Relaxing Rain",
        moodId: "sleep",
        category: "Sleep",
        soundUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
        id: "wood",
        title: "Wood Burning",
        durationLabel: "15 min • Focus",
        moodId: "focus",
        category: "Focus",
        soundUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
        id: "rain",
        title: "Heavy Rain",
        durationLabel: "60 min • Sleep",
        moodId: "sleep",
        category: "Sleep",
        soundUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
        id: "fire",
        title: "Cracking Fire",
        durationLabel: "10 min • Focus",
        moodId: "focus",
        category: "Focus",
        soundUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
];

const CONTINUE = SESSIONS.slice(1);

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

    const openPlayerForSession = (session: Session) => {
        router.push({
            pathname: "/(modal)/player",
            params: {
                soundUrl: session.soundUrl,
                title: session.title,
                subtitle: session.durationLabel,
            },
        });
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
                        <View key={mood.id} style={styles.moodTile}>
                            <LinearGradient
                                colors={mood.gradient}
                                style={styles.moodGradient}
                            >
                                <View style={styles.moodIconWrap}>
                                    <Ionicons name={mood.icon} color={mood.accent} size={20} />
                                </View>
                                <Text style={styles.moodTitle}>{mood.title}</Text>
                                <Text style={styles.moodDescription}>
                                    {mood.description}
                                </Text>
                            </LinearGradient>
                        </View>
                    ))}
                </View>

                {/* CONTINUE LISTENING SECTION */}
                <Text style={styles.sectionTitle}>Continue Listening</Text>
                <View style={styles.sessionList}>
                    {CONTINUE.map((session) => {
                        const mood = moodMap.get(session.moodId);
                        return (
                            <Pressable
                                key={session.id}
                                style={styles.sessionRow}
                                onPress={() => openPlayerForSession(session)}
                            >
                                <View
                                    style={[
                                        styles.sessionIconWrap,
                                        { backgroundColor: mood?.gradient[0] ?? Colors.palette.card },
                                    ]}
                                >
                                    <Ionicons
                                        name="play"
                                        color={mood?.accent ?? Colors.light.text}
                                        size={18}
                                    />
                                </View>

                                <View style={styles.sessionText}>
                                    <Text style={styles.sessionTitle}>{session.title}</Text>
                                    <Text style={styles.sessionMeta}>
                                        {session.durationLabel}
                                    </Text>
                                </View>

                                <Ionicons name="heart-outline" color={Colors.palette.muted} size={18} />
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

/* STYLES */
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
        paddingTop: 20, // Original padding
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
        width: 48,
        height: 48,
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