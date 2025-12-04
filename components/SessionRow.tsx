import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

type Session = {
    id: string;
    title: string;
    duration: string;
    moodId: string;
    category: string;
};

type MoodCard = {
    gradient: [string, string];
    accent: string;
};

type Props = {
    session: Session;
    mood?: MoodCard;
    onPress: (session: Session) => void;
};

export default function SessionRow({ session, mood, onPress }: Props) {
    return (
        <Pressable
            onPress={() => onPress(session)}
            className="flex-row items-center bg-gray-900 rounded-xl p-4 mb-3 space-x-3"
        >
            <View
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: mood?.gradient[0] ?? Colors.palette.surface }}
            >
                <Ionicons name="play" size={18} color={mood?.accent ?? Colors.light.text} />
            </View>
            <View className="flex-1">
                <Text className="text-white font-semibold">{session.title}</Text>
                <Text className="text-gray-400 text-sm mt-1">{session.duration}</Text>
            </View>
            <Ionicons name="heart-outline" size={20} color={Colors.palette.muted} />
        </Pressable>
    );
}
