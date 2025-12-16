import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    const initializeAuth = useAuthStore(state => state.initializeAuth);
    const isLoading = useAuthStore(state => state.isLoading);

    useEffect(() => {
        const unsubscribe = initializeAuth();
        return () => {
            unsubscribe();
        };
    }, [initializeAuth]);

    useEffect(() => {
        if (!isLoading) {
            SplashScreen.hideAsync();
        }
    }, [isLoading]);

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen
                            name="(modal)"
                            options={{
                                animation: "slide_from_bottom",
                            }}
                        />
                    </Stack>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
