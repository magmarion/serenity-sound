// components/MoodTile.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Mood = {
    id: string;
    title: string;
    description: string;
    gradient: [string, string];
    accent: string;
    iconName: string;
};

type Props = {
    mood: Mood;
    onPress: (mood: Mood) => void;
};

export default function MoodTile({ mood, onPress }: Props) {
    return (
        <Pressable onPress={() => onPress(mood)} className="w-1/2 rounded-2xl overflow-hidden mb-4">
            <LinearGradient colors={mood.gradient} className="p-5 rounded-2xl space-y-2">
                <View className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <Ionicons name={mood.iconName as any} size={20} color={mood.accent} />
                </View>
                <Text className="text-white font-bold text-lg">{mood.title}</Text>
                <Text className="text-gray-400 text-sm">{mood.description}</Text>
            </LinearGradient>
        </Pressable>
    );
}
