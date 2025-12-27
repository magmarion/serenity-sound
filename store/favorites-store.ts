import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/auth-store";
import { favoritesService } from "@/services/favorites-service";

export type Session = {
    id: string;
    title: string;
    durationLabel: string;
    moodId: string;
    category: string;
    soundUrl?: string;
    duration?: number;
    artworkUrl?: string;
};

type FavoritesStore = {
    favorites: Session[];

    isFavorite: (id: string) => boolean;

    toggleFavorite: (session: Session) => Promise<void>;
    addFavorite: (session: Session) => Promise<void>;
    removeFavorite: (id: string) => Promise<void>;

    loadFavoritesFromDb: () => Promise<void>;
    clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesStore>()(
    persist(
        (set, get) => ({
            favorites: [],

            isFavorite: (id: string) => {
                return get().favorites.some((fav) => fav.id === id);
            },

            toggleFavorite: async (session: Session) => {
                const uid = useAuthStore.getState().user?.uid;
                if (!uid) return;

                const exists = get().isFavorite(session.id);

                // Optimistic UI update
                set((state) => ({
                    favorites: exists
                        ? state.favorites.filter(
                            (fav) => fav.id !== session.id
                        )
                        : [...state.favorites, session],
                }));

                // Sync with Firestore
                if (exists) {
                    await favoritesService.removeFavorite(uid, session.id);
                } else {
                    await favoritesService.addFavorite(uid, session);
                }
            },

            addFavorite: async (session: Session) => {
                const uid = useAuthStore.getState().user?.uid;
                if (!uid) return;

                if (!get().isFavorite(session.id)) {
                    set((state) => ({
                        favorites: [...state.favorites, session],
                    }));

                    await favoritesService.addFavorite(uid, session);
                }
            },

            removeFavorite: async (id: string) => {
                const uid = useAuthStore.getState().user?.uid;
                if (!uid) return;

                set((state) => ({
                    favorites: state.favorites.filter(
                        (fav) => fav.id !== id
                    ),
                }));

                await favoritesService.removeFavorite(uid, id);
            },

            loadFavoritesFromDb: async () => {
                const uid = useAuthStore.getState().user?.uid;
                if (!uid) return;

                const data = await favoritesService.getFavorites(uid);
                set({ favorites: data });
            },

            clearFavorites: () => {
                set({ favorites: [] });
            },
        }),
        {
            name: "favorites-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
