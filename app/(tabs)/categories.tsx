import React, { useCallback, useMemo, useState } from "react";
import { Stack } from "expo-router";
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
    | "ocean";

type Category = {
    id: CategoryId;
    title: string;
    subtitle: string;
    colors: readonly [string, string];
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
};

const CATEGORIES: Category[] = [
    {
        id: "rain",
        title: "Rain",
        subtitle: "56 sounds",
        colors: ["#1D4ED8", "#0B1B3E"],
        icon: "CloudRain",
    },
    {
        id: "fireplace",
        title: "Fireplace",
        subtitle: "12 sounds",
        colors: ["#F97316", "#7C2D12"],
        icon: "Flame",
    },
    {
        id: "thunder",
        title: "Thunder",
        subtitle: "16 sounds",
        colors: ["#FB923C", "#9A3412"],
        icon: "CloudLightning",
    },
    {
        id: "forest",
        title: "Forest",
        subtitle: "24 sounds",
        colors: ["#0EA5A4", "#064E3B"],
        icon: "Trees",
    },
    {
        id: "cafe",
        title: "Cafe",
        subtitle: "19 sounds",
        colors: ["#15803D", "#064E3B"],
        icon: "Coffee",
    },
    {
        id: "bricks",
        title: "Bricks",
        subtitle: "21 sounds",
        colors: ["#F97316", "#9A3412"],
        icon: "Blocks",
    },
    {
        id: "wind",
        title: "Wind",
        subtitle: "10 sounds",
        colors: ["#111827", "#0B1220"],
        icon: "Wind",
    },
    {
        id: "night",
        title: "Night",
        subtitle: "21 sounds",
        colors: ["#111827", "#0B1220"],
        icon: "Moon",
    },
    {
        id: "water",
        title: "Water",
        subtitle: "15 sounds",
        colors: ["#111827", "#0B1220"],
        icon: "Waves",
    },
    {
        id: "ocean",
        title: "Ocean",
        subtitle: "18 sounds",
        colors: ["#111827", "#0B1220"],
        icon: "Waves",
    },
];

function CategoryIcon({ name }: { name: Category["icon"] }) {
    const iconColor = "rgba(255,255,255,0.92)";
    const iconSize = 20; // Slightly larger for clean look

    switch (name) {
        case "CloudRain":
            return <CloudRain color={iconColor} size={iconSize} />;
        case "Flame":
            return <Flame color={iconColor} size={iconSize} />;
        case "CloudLightning":
            return <CloudLightning color={iconColor} size={iconSize} />;
        case "Trees":
            return <Trees color={iconColor} size={iconSize} />;
        case "Coffee":
            return <Coffee color={iconColor} size={iconSize} />;
        case "Blocks":
            return <Blocks color={iconColor} size={iconSize} />;
        case "Wind":
            return <Wind color={iconColor} size={iconSize} />;
        case "Moon":
            return <Moon color={iconColor} size={iconSize} />;
        case "Waves":
            return <Waves color={iconColor} size={iconSize} />;
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
                colors={item.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.card,
                    isPressed && styles.cardPressed
                ]}
            >
                {/* Clean icon - no background pill */}
                <View style={styles.cardIconContainer}>
                    <CategoryIcon name={item.icon} />
                </View>

                <View style={styles.cardTextWrap}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {item.subtitle}
                    </Text>
                </View>

                {/* No gloss effect - plain gradient */}
            </LinearGradient>
        </Pressable>
    );
}

export default function CategoriesScreen() {
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
    }, []);

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
        <View style={styles.screen} testID="categories-screen">
            <Stack.Screen options={{ title: "Categories" }} />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Background */}
                <LinearGradient
                    colors={["#070C16", "#070C16"]}
                    style={StyleSheet.absoluteFill}
                />

                {/* Search bar */}
                <View style={styles.searchWrap}>
                    <View style={styles.searchInner}>
                        <Search color="rgba(234,242,255,0.70)" size={16} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Browse sounds"
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
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.rowWrapper}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    testID="categories-list"
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#070C16",
    },
    safeArea: {
        flex: 1,
    },
    searchWrap: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 10,
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
    listContent: {
        paddingBottom: 18,
    },
    rowWrapper: {
        paddingHorizontal: 16,
        marginBottom: 12,
        justifyContent: "space-between",
    },
    cardWrap: {
        width: "48%",
        aspectRatio: 1.6,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        padding: 16, // More padding for cleaner look
        overflow: "hidden",
        alignItems: "flex-start", // Align content to top-left
        justifyContent: "flex-start",
    },
    cardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    cardIconContainer: {
        marginBottom: 12, // Space between icon and text
    },
    cardTextWrap: {
        width: "100%",
    },
    cardTitle: {
        color: "rgba(255,255,255,0.96)",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },
    cardSubtitle: {
        color: "rgba(255,255,255,0.74)",
        fontSize: 13,
        fontWeight: "500",
    },
});