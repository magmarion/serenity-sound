import { Ionicons } from "@expo/vector-icons";

export type CategoryConfig = {
    title: string;
    gradient: [string, string];
    accent: string;
    icon: keyof typeof Ionicons.glyphMap;
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
    sleep: {
        title: "Sleep & Relaxation",
        gradient: ["#0E1C36", "#081125"],
        accent: "#6DA7FF",
        icon: "moon",
    },
    focus: {
        title: "Focus & Concentration",
        gradient: ["#3A1C09", "#1B1C37"],
        accent: "#F78A2C",
        icon: "flash",
    },
    calm: {
        title: "Calm & Nature",
        gradient: ["#1E1B4A", "#1A1034"],
        accent: "#8F7CFF",
        icon: "water",
    },
    recharge: {
        title: "Energy & Motivation",
        gradient: ["#0C1F1A", "#05100F"],
        accent: "#22C55E",
        icon: "battery-charging",
    },
    rain: {
        title: "Rain Sounds",
        gradient: ["#1E1B4A", "#1A1034"],
        accent: "#8F7CFF",
        icon: "rainy",
    },
    fireplace: {
        title: "Fireplace Sounds",
        gradient: ["#3A1C09", "#1B1C37"],
        accent: "#FF7C3A",
        icon: "flame",
    },
    thunder: {
        title: "Thunder & Storm",
        gradient: ["#111827", "#0B1220"],
        accent: "#0EA5E9",
        icon: "thunderstorm",
    },
    forest: {
        title: "Forest Sounds",
        gradient: ["#0C1F1A", "#05100F"],
        accent: "#22C55E",
        icon: "leaf",
    },
    cafe: {
        title: "Cafe Sounds",
        gradient: ["#3A1C09", "#1B1C37"],
        accent: "#FF7C3A",
        icon: "cafe",
    },
    bricks: {
        title: "Ambient Sounds",
        gradient: ["#1E1B4A", "#1A1034"],
        accent: "#FB923C",
        icon: "musical-notes",
    },
    wind: {
        title: "Wind Sounds",
        gradient: ["#111827", "#0B1220"],
        accent: "#A1A1AA",
        icon: "cloudy",
    },
    night: {
        title: "Night Sounds",
        gradient: ["#111827", "#0B1220"],
        accent: "#6366F1",
        icon: "moon",
    },
    water: {
        title: "Water Sounds",
        gradient: ["#111827", "#0B1220"],
        accent: "#0EA5E9",
        icon: "water",
    },
    ocean: {
        title: "Ocean Sounds",
        gradient: ["#111827", "#0B1220"],
        accent: "#0EA5E9",
        icon: "water",
    },
};

export function getCategoryDescription(categoryId: string): string {
    const descriptions: Record<string, string> = {
        sleep:
            "Gentle sounds and calming frequencies designed to help you relax, unwind, and prepare for restful sleep.",
        focus:
            "Concentration-enhancing audio to help you stay focused, productive, and in the zone during work or study sessions.",
        calm:
            "Nature-inspired sounds and peaceful atmospheres to reduce stress and bring tranquility to your day.",
        recharge:
            "Energetic sounds and uplifting frequencies to boost your motivation, energy, and mental clarity.",
        rain:
            "Soothing rain sounds ranging from gentle drizzles to heavy downpours, perfect for relaxation and focus.",
        fireplace:
            "Warm crackling fire sounds that create a cozy atmosphere, ideal for relaxation and meditation.",
        thunder:
            "Powerful thunderstorm sounds with deep rumbles and distant lightning, great for sleep and ambiance.",
        forest:
            "Natural forest ambience with birdsong, rustling leaves, and peaceful woodland sounds.",
        cafe:
            "Coffee shop ambience with gentle chatter and background noise, perfect for focus and productivity.",
        bricks:
            "Ambient soundscapes and atmospheric textures for creating a peaceful environment.",
        wind:
            "Gentle to powerful wind sounds that create a sense of space and tranquility.",
        night:
            "Peaceful nighttime sounds including crickets, distant owls, and quiet night ambience.",
        water:
            "Flowing water sounds from streams, rivers, and waterfalls for natural relaxation.",
        ocean:
            "Ocean waves and sea sounds that transport you to the beach for ultimate relaxation.",
    };

    return (
        descriptions[categoryId] ||
        "Collection of curated sounds for relaxation, focus, and well-being."
    );
}
