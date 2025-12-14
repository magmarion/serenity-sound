// app/store/favoritesStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    toggleFavorite: (session: Session) => void;
    addFavorite: (session: Session) => void;
    removeFavorite: (id: string) => void;
    clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesStore>()(
    persist(
        (set, get) => ({
            favorites: [],

            isFavorite: (id: string) => {
                return get().favorites.some(fav => fav.id === id);
            },

            toggleFavorite: (session: Session) => {
                set((state) => {
                    const exists = state.favorites.some(fav => fav.id === session.id);

                    if (exists) {
                        return {
                            favorites: state.favorites.filter(fav => fav.id !== session.id)
                        };
                    } else {
                        return {
                            favorites: [...state.favorites, session]
                        };
                    }
                });
            },

            addFavorite: (session: Session) => {
                if (!get().isFavorite(session.id)) {
                    set((state) => ({
                        favorites: [...state.favorites, session]
                    }));
                }
            },

            removeFavorite: (id: string) => {
                set((state) => ({
                    favorites: state.favorites.filter(fav => fav.id !== id)
                }));
            },

            clearFavorites: () => {
                set({ favorites: [] });
            },
        }),
        {
            name: 'favorites-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);