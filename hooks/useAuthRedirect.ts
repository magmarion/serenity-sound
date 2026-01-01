import { useAuthStore } from "@/store/auth-store";
import { router, useRootNavigationState, useSegments } from "expo-router";
import { useEffect } from "react";

export function useAuthRedirect() {
    const isLoading = useAuthStore((state) => state.isLoading);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const segments = useSegments();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        if (isLoading || !navigationState?.key) return;

        const currentSegment = segments[0] as string | undefined;
        const publicRoutes = ["index", "sign-in"];

        if (!isAuthenticated) {
            if (currentSegment && !publicRoutes.includes(currentSegment)) {
                router.replace("/");
            }
        } else {
            if (currentSegment === "index" || currentSegment === "sign-in") {
                router.replace("/(tabs)/home");
            }
        }
    }, [isAuthenticated, isLoading, segments, navigationState]);
}
