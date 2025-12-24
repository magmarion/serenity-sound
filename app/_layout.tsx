// app/_layout.tsx - UPDATED
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments, useRootNavigationState, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/auth-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const isLoading = useAuthStore((state) => state.isLoading);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const segments = useSegments();
    const navigationState = useRootNavigationState();

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

    // Auth redirection logic
    useEffect(() => {
        if (isLoading || !navigationState?.key) return;

        const currentSegment = segments[0];
        console.log("Auth check:", { isAuthenticated, currentSegment, segments });

        // Define public routes that don't require authentication
        const publicRoutes = ["index", "sign-in"]; // Landing page and sign-in
        const modalRoutes = ["(modal)"]; // Modal routes are special

        // If user is NOT authenticated and trying to access protected routes
        if (!isAuthenticated) {
            if (currentSegment && !publicRoutes.includes(currentSegment) && !modalRoutes.includes(currentSegment)) {
                console.log("Redirecting to landing (not authenticated)");
                router.replace("/");
            }
        }
        // If user IS authenticated and trying to access auth routes
        else if (isAuthenticated) {
            // Use type assertion to fix the TypeScript error
            const segment = currentSegment as string;
            if (segment === "index" || segment === "sign-in") {
                console.log("Redirecting to home (authenticated)");
                router.replace("/(tabs)/home");
            }
        }
    }, [isAuthenticated, isLoading, segments, navigationState]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: "transparent" },
                        }}
                    >
                        <Stack.Screen name="index" /> {/* Landing page */}
                        <Stack.Screen name="sign-in" /> {/* Sign in page */}
                        <Stack.Screen name="(tabs)" /> {/* Main app tabs */}
                        <Stack.Screen
                            name="(modal)"
                            options={{
                                presentation: "transparentModal",
                                animation: "none",
                            }}
                        />
                    </Stack>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}