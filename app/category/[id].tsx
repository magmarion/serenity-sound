// app/(tabs)/category/[id].tsx
import { fetchSoundEffects } from "@/services/api";
import Colors from "@/constants/colors";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

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

// Mood configuration matching your home screen
const MOOD_CONFIG: Record<string, { title: string; gradient: [string, string]; accent: string; icon: keyof typeof Ionicons.glyphMap }> = {
    sleep: {
        title: "Sleep & Relaxation",
        gradient: ["#0E1C36", "#081125"],
        accent: "#6DA7FF",
        icon: "moon"
    },
    focus: {
        title: "Focus & Concentration",
        gradient: ["#3A1C09", "#1B1C37"],
        accent: "#F78A2C",
        icon: "flash"
    },
    calm: {
        title: "Calm & Nature",
        gradient: ["#1E1B4A", "#1A1034"],
        accent: "#8F7CFF",
        icon: "water"
    },
    recharge: {
        title: "Energy & Motivation",
        gradient: ["#0C1F1A", "#05100F"],
        accent: "#4DE2C3",
        icon: "battery-charging"
    }
};

export default function CategoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const moodId = id || 'sleep';
    const moodConfig = MOOD_CONFIG[moodId] || MOOD_CONFIG.sleep;

    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setFavorites] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadCategorySounds();
    }, [moodId]);

    const loadCategorySounds = async () => {
        try {
            setLoading(true);
            setError(null);

            const categorySessions = await fetchSoundEffects(moodId);

            if (categorySessions.length > 0) {
                setSessions(categorySessions);
            } else {
                setError('No sounds found for this category');
                setSessions([]);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to load sounds');
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const openPlayerForSession = (session: Session) => {
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
        await Haptics.selectionAsync();
        setFavorites(prev => ({
            ...prev,
            [sessionId]: !prev[sessionId]
        }));
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={moodConfig.gradient}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.header}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={Colors.light.text} />
                    </Pressable>

                    <View style={styles.headerCenter}>
                        <View style={styles.moodIconWrap}>
                            <Ionicons name={moodConfig.icon} color={moodConfig.accent} size={24} />
                        </View>
                        <Text style={styles.categoryTitle}>{moodConfig.title}</Text>
                    </View>

                    <View style={styles.headerRight} />
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Description */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>
                        {moodId === 'sleep' && 'Soothing sounds to help you relax and fall asleep peacefully.'}
                        {moodId === 'focus' && 'Concentration-enhancing sounds to boost productivity and focus.'}
                        {moodId === 'calm' && 'Peaceful nature sounds to reduce stress and find tranquility.'}
                        {moodId === 'recharge' && 'Energetic sounds to uplift your mood and boost motivation.'}
                    </Text>
                </View>

                {/* Sounds List */}
                <Text style={styles.sectionTitle}>Sounds</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading sounds...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorMessage}>
                        <Text style={styles.errorText}>{error}</Text>
                        <Pressable onPress={loadCategorySounds} style={styles.retryButton}>
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
                            const sessionIsFavorite = isFavorite[session.id] || false;

                            return (
                                <View key={session.id} style={styles.sessionRow}>
                                    <Pressable onPress={() => openPlayerForSession(session)}>
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.sessionIconWrap,
                                                { backgroundColor: moodConfig.gradient[0] },
                                                pressed && { opacity: 0.8 }
                                            ]}>
                                                <Ionicons
                                                    name="play"
                                                    color={moodConfig.accent}
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

                                    <Pressable onPress={() => toggleFavorite(session.id)}>
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
    safeArea: {
        zIndex: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerCenter: {
        alignItems: 'center',
        flex: 1,
    },
    moodIconWrap: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    categoryTitle: {
        color: Colors.light.text,
        fontSize: 24,
        fontWeight: "800",
        textAlign: 'center',
    },
    headerRight: {
        width: 44,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        paddingTop: 10,
    },
    descriptionContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    descriptionText: {
        color: Colors.light.text,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    sectionTitle: {
        color: Colors.light.text,
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 20,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: Colors.palette.muted,
        fontSize: 16,
    },
    errorMessage: {
        padding: 30,
        alignItems: 'center',
        gap: 15,
    },
    errorText: {
        color: Colors.palette.muted,
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: Colors.light.accent,
        borderRadius: 10,
    },
    retryText: {
        color: Colors.light.surface,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.palette.muted,
        fontSize: 16,
    },
    sessionList: {
        gap: 12,
    },
    sessionRow: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
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
});