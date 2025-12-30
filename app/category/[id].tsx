import { BackButton } from '@/components/BackButton';
import { CategorySessionRow } from '@/components/category/CategorySessionRow';
import Colors from "@/constants/colors";
import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import { fetchSoundEffects, Session } from "@/services/api";
import { useFavoritesStore } from "@/store/favorites-store";
import { categoryDetailStyles as styles } from '@/styles/category/id.styles';
import { CATEGORY_CONFIG, getCategoryDescription } from '@/utils/categoryConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

export default function CategoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const categoryId = id || 'sleep';
    const categoryConfig = CATEGORY_CONFIG[categoryId] || CATEGORY_CONFIG.sleep;

    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInfoModal, setShowInfoModal] = useState(false);

    // Use Zustand store
    const { isFavorite } = useFavoritesStore();

    const loadCategorySounds = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log(`📡 Loading sounds for category: ${categoryId}`);
            const categorySessions = await fetchSoundEffects(categoryId);
            console.log(`Loaded ${categorySessions.length} sounds for ${categoryId}`);

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
    }, [categoryId]); // Add categoryId as dependency

    useEffect(() => {
        loadCategorySounds();
    }, [loadCategorySounds]); // Now it's stable

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

    const { handleToggleFavorite } = useToggleFavorite();

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
                    {/* REPLACE the custom back button with BackButton component */}
                    <BackButton
                        onPress={router.back}
                        accessibilityLabel="Go back to categories"
                        iconColor={Colors.light.text}
                        iconSize={24}
                    />

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
                        <View style={styles.sessionList}>
                            {sessions.map((session) => (
                                <CategorySessionRow
                                    key={session.id}
                                    session={session}
                                    accentColor={categoryConfig.accent}
                                    backgroundColor={categoryConfig.gradient[0]}
                                    isFavorite={isFavorite(session.id)}
                                    onPlay={openPlayerForSession}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))}
                        </View>
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