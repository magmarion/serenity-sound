// app/(tabs)/categories.tsx
import React, { useCallback, useMemo, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
    FlatList,
    ListRenderItem,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    CloudLightning,
    CloudRain,
    Coffee,
    Flame,
    Moon,
    Search,
    Trees,
    Waves,
    Wind,
    Blocks,
} from "lucide-react-native";
import { Ionicons } from '@expo/vector-icons';

type CategoryId =
    | "rain"
    | "fireplace"
    | "thunder"
    | "forest"
    | "cafe"
    | "bricks"
    | "wind"
    | "night"
    | "water"
    | "ocean"
    | "sleep"
    | "focus"
    | "calm"
    | "recharge";

type Category = {
    id: CategoryId;
    title: string;
    subtitle: string;
    gradient: readonly [string, string];
    accent: string;
    icon:
    | "CloudRain"
    | "Flame"
    | "CloudLightning"
    | "Trees"
    | "Coffee"
    | "Blocks"
    | "Wind"
    | "Moon"
    | "Waves";
    moodIcon?: keyof typeof Ionicons.glyphMap; // Added for home screen icon consistency
};

// Updated colors to match home screen mood tiles gradient style
const CATEGORIES: Category[] = [
    {
        id: "sleep",
        title: "Sleep",
        subtitle: "Drift off easily",
        gradient: ["#0E1C36", "#081125"] as const,
        accent: "#6DA7FF",
        icon: "Moon",
        moodIcon: "moon",
    },
    {
        id: "focus",
        title: "Focus",
        subtitle: "Sharpen your mind",
        gradient: ["#3A1C09", "#1B1C37"] as const,
        accent: "#F78A2C",
        icon: "Coffee",
        moodIcon: "flash",
    },
    {
        id: "calm",
        title: "Calm",
        subtitle: "Reduce stress",
        gradient: ["#1E1B4A", "#1A1034"] as const,
        accent: "#8F7CFF",
        icon: "Trees",
        moodIcon: "water",
    },
    {
        id: "recharge",
        title: "Recharge",
        subtitle: "Boost energy",
        gradient: ["#0C1F1A", "#05100F"] as const,
        accent: "#4DE2C3",
        icon: "CloudLightning",
        moodIcon: "battery-charging",
    },
    {
        id: "rain",
        title: "Rain",
        subtitle: "Rain & Storm",
        gradient: ["#1E1B4A", "#0A0F16"] as const,
        accent: "#8F7CFF",
        icon: "CloudRain",
    },
    {
        id: "fireplace",
        title: "Fireplace",
        subtitle: "Fire & Crackling",
        gradient: ["#3A1C09", "#1A0B06"] as const,
        accent: "#F78A2C",
        icon: "Flame",
    },
    {
        id: "thunder",
        title: "Thunder",
        subtitle: "Thunder & Lightning",
        gradient: ["#0E1C36", "#0A0F16"] as const,
        accent: "#6DA7FF",
        icon: "CloudLightning",
    },
    {
        id: "forest",
        title: "Forest",
        subtitle: "Forest & Nature",
        gradient: ["#0C1F1A", "#05100F"] as const,
        accent: "#4DE2C3",
        icon: "Trees",
    },
    {
        id: "cafe",
        title: "Cafe",
        subtitle: "Coffee Shop",
        gradient: ["#3A1C09", "#1B1C37"] as const,
        accent: "#F78A2C",
        icon: "Coffee",
    },
    {
        id: "bricks",
        title: "Bricks",
        subtitle: "Ambient Sounds",
        gradient: ["#1E1B4A", "#1A1034"] as const,
        accent: "#8F7CFF",
        icon: "Blocks",
    },
    {
        id: "wind",
        title: "Wind",
        subtitle: "Wind & Breeze",
        gradient: ["#0E1C36", "#081125"] as const,
        accent: "#6DA7FF",
        icon: "Wind",
    },
    {
        id: "night",
        title: "Night",
        subtitle: "Night Sounds",
        gradient: ["#0C1F1A", "#05100F"] as const,
        accent: "#4DE2C3",
        icon: "Moon",
    },
    {
        id: "water",
        title: "Water",
        subtitle: "Water Sounds",
        gradient: ["#1E1B4A", "#0A0F16"] as const,
        accent: "#8F7CFF",
        icon: "Waves",
    },
    {
        id: "ocean",
        title: "Ocean",
        subtitle: "Ocean & Waves",
        gradient: ["#0E1C36", "#081125"] as const,
        accent: "#6DA7FF",
        icon: "Waves",
    },
];

function CategoryIcon({ name, accent }: { name: Category["icon"]; accent: string }) {
    const iconSize = 20;

    switch (name) {
        case "CloudRain":
            return <CloudRain color={accent} size={iconSize} />;
        case "Flame":
            return <Flame color={accent} size={iconSize} />;
        case "CloudLightning":
            return <CloudLightning color={accent} size={iconSize} />;
        case "Trees":
            return <Trees color={accent} size={iconSize} />;
        case "Coffee":
            return <Coffee color={accent} size={iconSize} />;
        case "Blocks":
            return <Blocks color={accent} size={iconSize} />;
        case "Wind":
            return <Wind color={accent} size={iconSize} />;
        case "Moon":
            return <Moon color={accent} size={iconSize} />;
        case "Waves":
            return <Waves color={accent} size={iconSize} />;
        default:
            return null;
    }
}

function clampText(value: string) {
    return value.trim().replace(/\s+/g, " ");
}

function CategoryCard({
    item,
    onPress
}: {
    item: Category;
    onPress: (category: Category) => void;
}) {
    const [isPressed, setIsPressed] = useState(false);

    const handlePressIn = useCallback(() => {
        setIsPressed(true);
    }, []);

    const handlePressOut = useCallback(() => {
        setIsPressed(false);
    }, []);

    const handlePress = useCallback(() => {
        onPress(item);
    }, [item, onPress]);

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={styles.cardWrap}
            testID={`category-card-${item.id}`}
        >
            <LinearGradient
                colors={item.gradient}
                style={[
                    styles.moodGradient,
                    isPressed && { opacity: 0.9 }
                ]}
            >
                {/* Icon with circular background pill - matching home screen */}
                <View style={styles.moodIconWrap}>
                    {item.moodIcon ? (
                        <Ionicons name={item.moodIcon} color={item.accent} size={20} />
                    ) : (
                        <CategoryIcon name={item.icon} accent={item.accent} />
                    )}
                </View>
                
                <Text style={styles.moodTitle}>{item.title}</Text>
                <Text style={styles.moodDescription}>
                    {item.subtitle}
                </Text>
            </LinearGradient>
        </Pressable>
    );
}

export default function CategoriesScreen() {
    const router = useRouter();
    const [query, setQuery] = useState<string>("");

    const filtered = useMemo(() => {
        const q = clampText(query).toLowerCase();
        if (!q) return CATEGORIES;

        return CATEGORIES.filter((c) => {
            const haystack = `${c.title} ${c.subtitle}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [query]);

    const onPressCategory = useCallback((category: Category) => {
        console.log("[categories] press", category.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);

        router.push({
            pathname: '/category/[id]',
            params: { id: category.id }
        });
    }, [router]);

    const renderItem: ListRenderItem<Category> = useCallback(
        ({ item }) => {
            return (
                <CategoryCard
                    item={item}
                    onPress={onPressCategory}
                />
            );
        },
        [onPressCategory]
    );

    return (
        <View style={styles.container} testID="categories-screen">
            {/* Background - matching home screen */}
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />

            {/* EXTRA GRADIENT ABOVE HEADER - matching home screen */}
            <LinearGradient
                colors={["#591A1B", "#591A1B"]}
                style={styles.topGradientExtension}
            />

            <Stack.Screen options={{ title: "Categories" }} />
            
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* HEADER - matching home screen style */}
                <LinearGradient
                    colors={["#591A1B", "#0F172B", "#0B0E14"]}
                    locations={[0, 0.4, 1]}
                    style={styles.topBar}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Categories</Text>
                    </View>
                </LinearGradient>

                {/* SCROLL AREA */}
                <View style={styles.scrollArea}>
                    {/* Search bar */}
                    <View style={styles.searchWrap}>
                        <View style={styles.searchInner}>
                            <Search color="rgba(234,242,255,0.70)" size={16} />
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search Categories"
                                placeholderTextColor="rgba(234,242,255,0.44)"
                                style={styles.searchInput}
                                autoCapitalize="none"
                                autoCorrect={false}
                                testID="categories-search"
                            />
                        </View>
                    </View>

                    {/* Categories list */}
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        numColumns={2}
                        contentContainerStyle={styles.scrollContent}
                        columnWrapperStyle={styles.moodGrid}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        testID="categories-list"
                    />
                </View>
            </SafeAreaView>
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
        flex: 1,
        zIndex: 2,
    },
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
    header: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "800",
        textAlign: "left",
        maxWidth: 280,
    },
    scrollArea: {
        flex: 1,
        marginTop: 0,
    },
    searchWrap: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    searchInner: {
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: "#EAF2FF",
        fontSize: 14,
        paddingVertical: 0,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 20,
    },
    moodGrid: {
        justifyContent: "space-between",
        rowGap: 16,
    },
    cardWrap: {
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
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    moodDescription: {
        color: "rgba(255,255,255,0.74)",
        fontSize: 13,
    },
});