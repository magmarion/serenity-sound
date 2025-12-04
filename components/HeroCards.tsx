import React, { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export default function HeroCard() {
    const heroTilt = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    return (
        <Animated.View
            style={[
                { transform: heroTilt.getTranslateTransform() },
            ]}
            className="rounded-2xl overflow-hidden"
        >
            <LinearGradient
                colors={["#2F1A5A", "#131A3A"]}
                className="p-6 rounded-2xl"
            >
                <View className="space-y-3">
                    <Text className="text-gray-400 text-sm uppercase tracking-wider">Recommended</Text>
                    <Text className="text-white text-2xl font-extrabold">Deep Focus</Text>
                    <Text className="text-gray-400 text-sm leading-5">
                        Slip into a productive flow with layered ambient tones.
                    </Text>
                    <Pressable className="flex-row items-center self-start space-x-2 px-4 py-2 rounded-full bg-white/12">
                        <Ionicons name="play" size={20} color={Colors.light.text} />
                        <Text className="text-white font-semibold text-base">Play</Text>
                    </Pressable>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}
