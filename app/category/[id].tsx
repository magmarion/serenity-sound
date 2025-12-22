// app/category/[id].tsx
import Colors from "@/constants/colors";
import { fetchSoundEffects, Session } from "@/services/api";
import { useFavoritesStore } from "@/store/favorites-store";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { categoryDetailStyles as styles } from './styles/[id].styles';

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

// Category configuration for all categories
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
            console.log(`📡 Loading sounds for category: ${categoryId}`);
            const categorySessions = await fetchSoundEffects(categoryId);
            console.log(`✅ Loaded ${categorySessions.length} sounds for ${categoryId}`);

            if (categorySessions.length > 0) {
                setSessions(categorySessions);
            } else {
                console.log(`⚠️ No sounds found for category: ${categoryId}`);
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
                // ADD THESE:
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
                    <Pressable
                        onPress={handleBack}
                        style={styles.backButton}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        accessibilityHint="Returns to the previous screen"
                    >
                        <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
                    </Pressable>

                    <View style={styles.headerCenter}>
                        <Text style={styles.categoryTitle}>{categoryConfig.title}</Text>
                        {/* ADDED: Sounds counter under title */}
                        <Text style={styles.soundsCounter}>
                            {loading ? 'Loading sounds...' :
                                error ? 'Error loading sounds' :
                                    sessions.length === 0 ? 'No sounds available' :
                                        `${sessions.length} sound${sessions.length !== 1 ? 's' : ''} available`}
                        </Text>
                    </View>

                    <Pressable
                        onPress={handleInfoPress}
                        style={styles.infoButton}
                        accessibilityRole="button"
                        accessibilityLabel="Category information"
                        accessibilityHint="Opens information about this category"
                    >
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
                        <Pressable
                            onPress={loadCategorySounds}
                            style={styles.retryButton}
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
                    onPress={() => setShowInfoModal(false)}
                    style={styles.modalOverlay}
                    accessibilityRole="button"
                    accessibilityLabel="Close category information"
                    accessibilityHint="Closes the information dialog"
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
                                accessibilityRole="button"
                                accessibilityLabel="Close"
                                accessibilityHint="Closes the information dialog"
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