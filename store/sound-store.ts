// store/sound-store.ts
import { create } from 'zustand';
import { Session } from '@/services/api';

interface SoundState {
    currentlyPlaying: Session | null;
    favorites: Session[];
    playSound: (sound: Session) => void;
    pauseSound: () => void;
    toggleFavorite: (sound: Session) => void;
}

export const useSoundStore = create<SoundState>((set) => ({
    currentlyPlaying: null,
    favorites: [],

    playSound: (sound: Session) => set({ currentlyPlaying: sound }),

    pauseSound: () => set({ currentlyPlaying: null }),

    toggleFavorite: (sound: Session) => set((state) => {
        const isFavorite = state.favorites.some(fav => fav.id === sound.id);
        if (isFavorite) {
            return {
                favorites: state.favorites.filter(fav => fav.id !== sound.id)
            };
        } else {
            return {
                favorites: [...state.favorites, sound]
            };
        }
    }),
}));