// constants/data.ts
export const MOOD_CARDS = [
    {
        id: "focus",
        title: "Focus",
        description: "Sharpen your mind",
        gradient: ["#3A1C09", "#1B1C37"],
        accent: "#F78A2C",
        iconName: "flash",
    },
    {
        id: "calm",
        title: "Calm",
        description: "Reduce stress",
        gradient: ["#1E1B4A", "#1A1034"],
        accent: "#8F7CFF",
        iconName: "water",
    },
    {
        id: "sleep",
        title: "Sleep",
        description: "Drift off easily",
        gradient: ["#0E1C36", "#081125"],
        accent: "#6DA7FF",
        iconName: "moon",
    },
    {
        id: "recharge",
        title: "Recharge",
        description: "Boost energy",
        gradient: ["#0C1F1A", "#05100F"],
        accent: "#4DE2C3",
        iconName: "battery-charging",
    },
];

export const CONTINUE_SESSIONS = [
    { id: "ocean", title: "Ocean Waves", duration: "45 min · Sleep", moodId: "sleep", category: "Sleep" },
    { id: "wood", title: "Wood Burning", duration: "15 min · Focus", moodId: "focus", category: "Focus" },
    { id: "rain", title: "Heavy Rain", duration: "60 min · Sleep", moodId: "sleep", category: "Sleep" },
    { id: "fire", title: "Cracking Fire", duration: "10 min · Focus", moodId: "focus", category: "Focus" },
];
