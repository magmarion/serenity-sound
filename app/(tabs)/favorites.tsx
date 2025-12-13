import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FavoriteKey =
    | "rain"
    | "fireplace"
    | "forest"
    | "thunder"
    | "ocean"
    | "wind"
    | "meditation"
    | "water"
    | "white-noise"
    | "campfire";

type FavoriteItem = {
    key: FavoriteKey;
    title: string;
    gradient: readonly [string, string];
    iconBg: string;
    iconName: React.ComponentProps<typeof Ionicons>["name"] | React.ComponentProps<typeof Feather>["name"];
    iconSet: "Ionicons" | "Feather";
};

const ITEMS: FavoriteItem[] = [
    {
        key: "rain",
        title: "Rain",
        gradient: ["#2B3442", "#121720"],
        iconBg: "rgba(255,255,255,0.12)",
        iconName: "rainy",
        iconSet: "Ionicons"
    },
    {
        key: "fireplace",
        title: "Fireplace",
        gradient: ["#F26B1D", "#C43C07"],
        iconBg: "rgba(255,255,255,0.16)",
        iconName: "flame",
        iconSet: "Ionicons"
    },
    {
        key: "forest",
        title: "Forest",
        gradient: ["#1B8C7A", "#0F5B4F"],
        iconBg: "rgba(255,255,255,0.14)",
        iconName: "leaf",
        iconSet: "Ionicons"
    },
    {
        key: "thunder",
        title: "Thunder",
        gradient: ["#2A63FF", "#1236A7"],
        iconBg: "rgba(255,255,255,0.16)",
        iconName: "thunderstorm",
        iconSet: "Ionicons"
    },
    {
        key: "ocean",
        title: "Ocean",
        gradient: ["#2B3442", "#131A23"],
        iconBg: "rgba(255,255,255,0.12)",
        iconName: "water",
        iconSet: "Ionicons"
    },
    {
        key: "wind",
        title: "Wind",
        gradient: ["#2B3442", "#141A23"],
        iconBg: "rgba(255,255,255,0.16)",
        iconName: "wind",
        iconSet: "Feather"
    },
    {
        key: "meditation",
        title: "Meditation",
        gradient: ["#2A63FF", "#163DBA"],
        iconBg: "rgba(255,255,255,0.16)",
        iconName: "moon",
        iconSet: "Ionicons"
    },
    {
        key: "water",
        title: "Water",
        gradient: ["#17B69C", "#0B6E60"],
        iconBg: "rgba(255,255,255,0.14)",
        iconName: "water",
        iconSet: "Ionicons"
    },
    {
        key: "white-noise",
        title: "White Noise",
        gradient: ["#2B3442", "#141A23"],
        iconBg: "rgba(255,255,255,0.12)",
        iconName: "radio",
        iconSet: "Feather"
    },
    {
        key: "campfire",
        title: "Campfire",
        gradient: ["#F26B1D", "#B62F0A"],
        iconBg: "rgba(255,255,255,0.16)",
        iconName: "bonfire",
        iconSet: "Ionicons"
    },
];

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

type RowProps = {
    item: FavoriteItem;
    isFavorite: boolean;
    onToggleFavorite: (key: FavoriteKey) => void;
    onPlay: (key: FavoriteKey) => void;
};

const FavoriteRow = memo(function FavoriteRow({
    item,
    isFavorite,
    onToggleFavorite,
    onPlay,
}: RowProps) {
    const [isPressed, setIsPressed] = useState(false);

    const IconComponent = (item.iconSet === 'Feather' ? Feather : Ionicons) as React.ComponentType<any>;

    const onPressPlay = useCallback(() => {
        onPlay(item.key);
    }, [item.key, onPlay]);

    const onPressHeart = useCallback(() => {
        onToggleFavorite(item.key);
    }, [item.key, onToggleFavorite]);

    return (
        <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.cardInner}>
                <View style={styles.left}>
                    <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                        <IconComponent name={item.iconName} size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                </View>

                <View style={styles.actions}>
                    <View style={[
                        styles.playContainer,
                        isPressed && { transform: [{ scale: 0.9 }] }
                    ]}>
                        <Pressable
                            testID={`favorites.play.${item.key}`}
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
                        testID={`favorites.heart.${item.key}`}
                        accessibilityRole="button"
                        onPress={onPressHeart}
                        hitSlop={10}
                        style={({ pressed }) => [
                            styles.heartBtn,
                            pressed ? { transform: [{ scale: 0.96 }], opacity: 0.85 } : null,
                        ]}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
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
    const [favorites, setFavorites] = useState<Record<FavoriteKey, boolean>>({
        rain: true,
        fireplace: true,
        forest: true,
        thunder: true,
        ocean: true,
        wind: true,
        meditation: true,
        water: true,
        "white-noise": true,
        campfire: true,
    });

    const haptics = useHaptics();

    const onToggleFavorite = useCallback(
        async (key: FavoriteKey) => {
            await haptics("light");
            setFavorites((prev) => {
                const next: Record<FavoriteKey, boolean> = { ...prev, [key]: !prev[key] };
                console.log("Favorite toggled:", key, "=>", next[key]);
                return next;
            });
        },
        [haptics]
    );

    const onPlay = useCallback(
        async (key: FavoriteKey) => {
            await haptics("success");
            console.log("Play pressed:", key);
            Alert.alert("Play", `Playing ${key}...`);
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

                <FlatList
                    testID="favorites.list"
                    data={ITEMS}
                    keyExtractor={(item, index) => `${item.key}-${index}`}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <FavoriteRow
                            item={item}
                            isFavorite={favorites[item.key] ?? false}
                            onToggleFavorite={onToggleFavorite}
                            onPlay={onPlay}
                        />
                    )}
                />
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
        borderColor: "rgba(255, 255, 255, 0.1)",
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