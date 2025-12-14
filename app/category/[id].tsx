// app/category/[id].tsx
import Colors from "@/constants/colors";
import { fetchSoundEffects } from "@/services/api";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

const CATEGORY_CONFIG: Record<string, { title: string; gradient: [string, string]; accent: string; icon: keyof typeof Ionicons.glyphMap }> = {
    // Mood categories
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
    },
    // Sound categories
    rain: {
        title: "Rain Sounds",
        gradient: ["#1D4ED8", "#0B1B3E"],
        accent: "#6DA7FF",
        icon: "rainy"
    },
    fireplace: {
        title: "Fireplace Sounds",
        gradient: ["#F97316", "#7C2D12"],
        accent: "#FF7C3A",
        icon: "flame"
    },
    thunder: {
        title: "Thunder & Storm",
        gradient: ["#FB923C", "#9A3412"],
        accent: "#FFA94D",
        icon: "thunderstorm"
    },
    forest: {
        title: "Forest Sounds",
        gradient: ["#0EA5A4", "#064E3B"],
        accent: "#2DD4BF",
        icon: "leaf"
    },
    cafe: {
        title: "Cafe Sounds",
        gradient: ["#15803D", "#064E3B"],
        accent: "#22C55E",
        icon: "cafe"
    },
    bricks: {
        title: "Ambient Sounds",
        gradient: ["#F97316", "#9A3412"],
        accent: "#FB923C",
        icon: "musical-notes"
    },
    wind: {
        title: "Wind Sounds",
        gradient: ["#111827", "#0B1220"],
        accent: "#A1A1AA",
        icon: "cloudy"
    },
    night: {
        title: "Night Sounds",
        gradient: ["#111827", "#0B1220"],
        accent: "#6366F1",
        icon: "moon"
    },
    water: {
        title: "Water Sounds",
        gradient: ["#111827", "#0B1220"],
        accent: "#0EA5E9",
        icon: "water"
    },
    ocean: {
        title: "Ocean Sounds",
        gradient: ["#111827", "#0B1220"],
        accent: "#0EA5E9",
        icon: "water"
    }
};


export default function CategoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const categoryId = id || 'sleep';
    const categoryConfig = CATEGORY_CONFIG[categoryId] || CATEGORY_CONFIG.sleep;

    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInfoModal, setShowInfoModal] = useState(false);

    // Use Zustand store
    const { isFavorite, toggleFavorite } = useFavoritesStore();

    useEffect(() => {
        loadCategorySounds();
    }, [categoryId]);

    const loadCategorySounds = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use fetchSoundEffects with the category ID
            const categorySessions = await fetchSoundEffects(categoryId);

            if (categorySessions.length > 0) {
                setSessions(categorySessions);
            } else {
                setError('No sounds found for this category');
                setSessions([]);
            }
        } catch (err) {
            console.error('Error loading category sounds:', err);
            setError('Failed to load sounds. Please try again.');
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

    const handleToggleFavorite = async (session: Session) => {
        await Haptics.selectionAsync();
        toggleFavorite(session);
    };

    const handleBack = () => {
        router.back();
    };

    const handleInfoPress = () => {
        Haptics.selectionAsync();
        setShowInfoModal(true);
    };

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={categoryConfig.gradient}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.header}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
                    </Pressable>

                    <View style={styles.headerCenter}>
                        <Text style={styles.categoryTitle}>{categoryConfig.title}</Text>
                    </View>

                    <Pressable onPress={handleInfoPress} style={styles.infoButton}>
                        <Ionicons name="information-circle-outline" size={24} color={Colors.light.text} />
                    </Pressable>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
                            const sessionIsFavorite = isFavorite(session.id);

                            return (
                                <View key={session.id} style={styles.sessionRow}>
                                    <Pressable onPress={() => openPlayerForSession(session)}>
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.sessionIconWrap,
                                                { backgroundColor: categoryConfig.gradient[0] },
                                                pressed && { opacity: 0.8 }
                                            ]}>
                                                <Ionicons
                                                    name="play"
                                                    color={categoryConfig.accent}
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

                                    <Pressable onPress={() => handleToggleFavorite(session)}>
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

            {/* Info Modal */}
            {showInfoModal && (
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowInfoModal(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: categoryConfig.gradient[0] }]}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalIconWrap, { backgroundColor: categoryConfig.accent + '20' }]}>
                                <Ionicons name={categoryConfig.icon} color={categoryConfig.accent} size={24} />
                            </View>
                            <Text style={styles.modalTitle}>{categoryConfig.title}</Text>
                            <Pressable
                                onPress={() => setShowInfoModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color={Colors.light.text} />
                            </Pressable>
                        </View>

                        <Text style={styles.modalDescription}>
                            {getCategoryDescription(categoryId)}
                        </Text>
                    </View>
                </Pressable>
            )}
        </View>
    );
}

// Helper function for category descriptions
function getCategoryDescription(categoryId: string): string {
    const descriptions: Record<string, string> = {
        sleep: "Gentle sounds and calming frequencies designed to help you relax, unwind, and prepare for restful sleep.",
        focus: "Concentration-enhancing audio to help you stay focused, productive, and in the zone during work or study sessions.",
        calm: "Nature-inspired sounds and peaceful atmospheres to reduce stress and bring tranquility to your day.",
        recharge: "Energetic sounds and uplifting frequencies to boost your motivation, energy, and mental clarity.",
        rain: "Soothing rain sounds ranging from gentle drizzles to heavy downpours, perfect for relaxation and focus.",
        fireplace: "Warm crackling fire sounds that create a cozy atmosphere, ideal for relaxation and meditation.",
        thunder: "Powerful thunderstorm sounds with deep rumbles and distant lightning, great for sleep and ambiance.",
        forest: "Natural forest ambience with birdsong, rustling leaves, and peaceful woodland sounds.",
        cafe: "Coffee shop ambience with gentle chatter and background noise, perfect for focus and productivity.",
        bricks: "Ambient soundscapes and atmospheric textures for creating a peaceful environment.",
        wind: "Gentle to powerful wind sounds that create a sense of space and tranquility.",
        night: "Peaceful nighttime sounds including crickets, distant owls, and quiet night ambience.",
        water: "Flowing water sounds from streams, rivers, and waterfalls for natural relaxation.",
        ocean: "Ocean waves and sea sounds that transport you to the beach for ultimate relaxation."
    };

    return descriptions[categoryId] || "Collection of curated sounds for relaxation, focus, and well-being.";
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        zIndex: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerCenter: {
        alignItems: 'center',
        flex: 1,
    },
    infoButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryTitle: {
        color: Colors.light.text,
        fontSize: 18,
        fontWeight: "600",
        textAlign: 'center',
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        paddingTop: 10,
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
    // Modal Styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    modalIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: '700',
        flex: 1,
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalDescription: {
        color: Colors.palette.muted,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
});