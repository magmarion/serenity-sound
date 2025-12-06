// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                    {/* Your main tab navigation */}
                    <Stack.Screen name="(tabs)" />

                    {/* Enable modal presentation for the modals folder */}
                    <Stack.Screen
                        name="(modals)"
                        options={{
                            presentation: "modal",            // iOS-style modal
                            animation: "slide_from_bottom",    // bottom slide animation
                        }}
                    />
                </Stack>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
