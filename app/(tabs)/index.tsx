import HeroCard from "@/components/HeroCards";
import HomeErrorBoundary from "@/components/HomeErrorBoundary";
import MoodTile from "@/components/MoodTile";
import SessionRow from "@/components/SessionRow";
import TopBar from "@/components/TopBar";
import { CONTINUE_SESSIONS, MOOD_CARDS } from "@/constants/data";
import { default as React, useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { Mood, Session } from "@/types";

export default function HomeScreen() {
    const handleMoodPress = useCallback((mood: Mood) => {
        console.log("Mood tapped:", mood.title);
    }, []);

    const handleSessionPress = useCallback((session: Session) => {
        console.log("Session tapped:", session.title);
    }, []);

    return (
        <HomeErrorBoundary>
            <View className="flex-1 bg-black">
                <TopBar />

                <ScrollView
                    contentContainerClassName="px-5 pt-8 pb-32 space-y-5"
                    showsVerticalScrollIndicator={false}
                >
                    <HeroCard />

                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-white text-xl font-bold">Moods</Text>
                            <Text className="text-gray-400 text-sm">Tap to set the vibe</Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap justify-between">
                        {MOOD_CARDS.map((mood) => (
                            <MoodTile key={mood.id} mood={mood} onPress={handleMoodPress} />
                        ))}
                    </View>

                    <View className="flex-row justify-between items-center mt-6">
                        <View>
                            <Text className="text-white text-xl font-bold">Continue Listening</Text>
                            <Text className="text-gray-400 text-sm">Pick up where you left off</Text>
                        </View>
                    </View>

                    <View>
                        {CONTINUE_SESSIONS.map((session) => (
                            <SessionRow
                                key={session.id}
                                session={session}
                                mood={MOOD_CARDS.find((m) => m.id === session.moodId)}
                                onPress={handleSessionPress}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>
        </HomeErrorBoundary>
    );
}
