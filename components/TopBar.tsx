// components/TopBar.tsx
import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const avatarUri = "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80";

export default function TopBar() {
    return (
        <View className="pt-14 px-5 pb-6 bg-black/95 rounded-b-2xl shadow-lg z-20">
            {/* Header row */}
            <View className="flex-row justify-between items-center">
                {/* Profile row */}
                <View className="flex-row items-center space-x-3">
                    <Image
                        source={{ uri: avatarUri }}
                        className="w-12 h-12 rounded-full"
                    />
                    <View>
                        <Text className="text-gray-400 text-sm">Good evening,</Text>
                        <Text className="text-white text-lg font-bold">Sarah</Text>
                    </View>
                </View>

                {/* Heart badge */}
                <Pressable className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center">
                    <Ionicons name="heart-outline" size={18} color={Colors.light.text} />
                </Pressable>
            </View>

            {/* Top prompt */}
            <Text className="text-white text-2xl font-extrabold leading-9 mt-4 max-w-[280px]">
                How do you want to feel today?
            </Text>
        </View>
    );
}
