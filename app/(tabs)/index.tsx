// app/index.tsx
import React from "react";
import { ScrollView, View } from "react-native";
import TopBar from "@/components/TopBar";

export default function HomeScreen() {
    return (
        <View className="flex-1 bg-black">
            <TopBar />

            <ScrollView
                contentContainerClassName="px-5 pt-8 pb-32 space-y-5"
                showsVerticalScrollIndicator={false}
            >
                {/* Här lägger du HeroCard, Moods Grid, Continue Listening osv */}
            </ScrollView>
        </View>
    );
}
