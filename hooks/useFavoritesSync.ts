import { useAuthStore } from "@/store/auth-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { useEffect } from "react";

export function useFavoritesSync() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);

    const loadFavoritesFromDb = useFavoritesStore(
        (state) => state.loadFavoritesFromDb
    );
    const clearFavorites = useFavoritesStore(
        (state) => state.clearFavorites
    );

    useEffect(() => {
        if (isLoading) return;

        if (isAuthenticated) {
            loadFavoritesFromDb();
        } else {
            clearFavorites();
        }
    }, [isAuthenticated, isLoading, loadFavoritesFromDb, clearFavorites]);
}
