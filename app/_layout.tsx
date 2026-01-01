import { ToastProvider } from "@/components/ToastContext";
import { useAuthStore } from "@/store/auth-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const isLoading = useAuthStore((state) => state.isLoading);
    useAuthRedirect();

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
        <ToastProvider>
            <QueryClientProvider client={queryClient}>
                <SafeAreaProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: "transparent" },
                            }}
                        >
                            <Stack.Screen name="index" />
                            <Stack.Screen name="sign-in" />
                            <Stack.Screen name="(tabs)" />
                            <Stack.Screen
                                name="(modal)"
                                options={{
                                    presentation: "transparentModal",
                                    animation: "none",
                                }}
                            />
                        </Stack>
                        {isLoading && (
                            <View
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: "black",
                                }}
                            >
                                <ActivityIndicator size="large" />
                            </View>
                        )}
                    </GestureHandlerRootView>
                </SafeAreaProvider>
            </QueryClientProvider>
        </ToastProvider>
    );
}