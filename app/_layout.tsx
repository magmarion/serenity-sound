import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from '@/store/auth-store'; // Import your store

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    // Get the initialize function from the store
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        // Initialize auth listener when the app starts
        const unsubscribe = initializeAuth();

        // Hide splash screen after a short delay or when auth state is determined
        // For now, we'll hide it after a brief delay
        const timer = setTimeout(() => {
            SplashScreen.hideAsync();
        }, 500);

        // Cleanup function: unsubscribe from auth listener and clear timer
        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, [initializeAuth]); // Run when initializeAuth changes

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        {/* Enable modal presentation for the modal folder */}
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