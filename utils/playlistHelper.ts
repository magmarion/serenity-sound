// utils/playlistHelpers.ts
import { Session } from '@/services/api';

const ART_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const DEFAULT_SOUND_URL = "https://orangefreesounds.com/wp-content/uploads/2022/08/Rain-and-thunder-with-ocean-waves-sound-effect.mp3";

// Interface for the playlist item that will be passed to player
export interface PlaylistItem {
    id: string;
    title: string;
    durationLabel: string;
    moodId: string;
    category: string;
    soundUrl: string;
    artworkUrl?: string;
    duration: number;
}

export function createPlaylist(sessions: Session[]): PlaylistItem[] {
    return sessions
        .filter(s => s.soundUrl)
        .map(s => ({
            id: s.id,
            title: s.title || 'Sound',
            durationLabel: s.durationLabel || '3 min • Ambient',
            moodId: s.moodId || 'calm',
            category: s.category || 'Ambient Sounds',
            soundUrl: s.soundUrl || DEFAULT_SOUND_URL,
            artworkUrl: s.artworkUrl || ART_URL,
            duration: s.duration || 180
        }));
}

export function findSessionIndex(playlist: PlaylistItem[], sessionId: string): number {
    return playlist.findIndex(track => track.id === sessionId);
}