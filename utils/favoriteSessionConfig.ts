
export type SessionConfig = {
    gradient: readonly [string, string];
    iconName: string;
    iconSet: "Ionicons" | "Feather";
    iconBg: string;
};

export const getSessionConfig = (session: any): SessionConfig => {
    const title = session.title?.toLowerCase() || "";
    const moodId = session.moodId?.toLowerCase() || "";

    if (title.includes("rain") || title.includes("rainy")) {
        return {
            gradient: ["#2B3442", "#121720"],
            iconName: "rainy",
            iconSet: "Ionicons",
            iconBg: "rgba(255,255,255,0.12)",
        };
    }

    if (title.includes("fire") || title.includes("fireplace")) {
        return {
            gradient: ["#F26B1D", "#C43C07"],
            iconName: "flame",
            iconSet: "Ionicons",
            iconBg: "rgba(255,255,255,0.16)",
        };
    }

    if (title.includes("forest") || title.includes("woods")) {
        return {
            gradient: ["#1B8C7A", "#0F5B4F"],
            iconName: "leaf",
            iconSet: "Ionicons",
            iconBg: "rgba(255,255,255,0.14)",
        };
    }

    if (title.includes("thunder") || title.includes("storm")) {
        return {
            gradient: ["#2A63FF", "#1236A7"],
            iconName: "thunderstorm",
            iconSet: "Ionicons",
            iconBg: "rgba(255,255,255,0.16)",
        };
    }

    if (title.includes("ocean") || title.includes("sea")) {
        return {
            gradient: ["#2B3442", "#131A23"],
            iconName: "water",
            iconSet: "Ionicons",
            iconBg: "rgba(255,255,255,0.12)",
        };
    }

    if (title.includes("wind") || title.includes("breeze")) {
        return {
            gradient: ["#2B3442", "#141A23"],
            iconName: "wind",
            iconSet: "Feather",
            iconBg: "rgba(255,255,255,0.16)",
        };
    }

    if (title.includes("meditation") || title.includes("relax")) {
        return {
            gradient: ["#2A63FF", "#163DBA"],
            iconName: "moon",
            iconSet: "Ionicons",
            iconBg: "rgba(255,255,255,0.16)",
        };
    }

    if (title.includes("water") || title.includes("stream")) {
        return {
            gradient: ["#17B69C", "#0B6E60"],
            iconName: "water",
            iconSet: "Ionicons",
            iconBg: "rgba(255,255,255,0.14)",
        };
    }

    if (title.includes("white noise") || title.includes("static")) {
        return {
            gradient: ["#2B3442", "#141A23"],
            iconName: "radio",
            iconSet: "Feather",
            iconBg: "rgba(255,255,255,0.12)",
        };
    }

    if (title.includes("campfire") || title.includes("bonfire")) {
        return {
            gradient: ["#F26B1D", "#B62F0A"],
            iconName: "bonfire",
            iconSet: "Ionicons",
            iconBg: "rgba(255,255,255,0.16)",
        };
    }

    switch (moodId) {
        case "focus":
            return {
                gradient: ["#3A1C09", "#1B1C37"],
                iconName: "flash",
                iconSet: "Ionicons",
                iconBg: "rgba(255,255,255,0.12)",
            };
        case "calm":
            return {
                gradient: ["#1E1B4A", "#1A1034"],
                iconName: "water",
                iconSet: "Ionicons",
                iconBg: "rgba(255,255,255,0.12)",
            };
        case "sleep":
            return {
                gradient: ["#0E1C36", "#081125"],
                iconName: "moon",
                iconSet: "Ionicons",
                iconBg: "rgba(255,255,255,0.12)",
            };
        case "recharge":
            return {
                gradient: ["#0C1F1A", "#05100F"],
                iconName: "battery-charging",
                iconSet: "Ionicons",
                iconBg: "rgba(255,255,255,0.12)",
            };
        default:
            return {
                gradient: ["#2B3442", "#121720"],
                iconName: "musical-notes",
                iconSet: "Ionicons",
                iconBg: "rgba(255,255,255,0.12)",
            };
    }
};
