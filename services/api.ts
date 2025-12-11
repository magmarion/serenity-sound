// services/api.ts - WORKING VERSION
const JAMENDO_CLIENT_ID = '5fe79c4a'; // Your working key

export interface Session {
    id: string;
    title: string;
    durationLabel: string;
    duration: number;
    moodId: string;
    category: string;
    soundUrl: string;
    artworkUrl?: string;
}
export async function fetchSounds(): Promise<Session[]> {
    try {
        console.log('Fetching from Jamendo API...');

        // SIMPLE, WORKING API CALL - No tags parameter
        const response = await fetch(
            `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&order=popularity_total&search=rain nature`
        );

        if (!response.ok) {
            console.error('Jamendo API error:', response.status);
            throw new Error(`Jamendo API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Jamendo API successful! Results:', data.results?.length || 0);

        // Check if we have results
        if (!data.results || data.results.length === 0) {
            console.warn('No tracks found - but API call succeeded');
            throw new Error('No tracks found');
        }

        // Transform Jamendo results to your Session type
        return data.results.map((track: any, index: number) => {
            const duration = track.duration || 180;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);

            // Determine mood based on track info
            const moodId = determineMood(track);

            return {
                id: track.id.toString(),
                title: track.name || `Track ${index + 1}`,
                durationLabel: `${minutes} min ${seconds} sec • ${moodId.charAt(0).toUpperCase() + moodId.slice(1)}`,
                duration: duration,
                moodId: moodId,
                category: moodId.charAt(0).toUpperCase() + moodId.slice(1),
                soundUrl: track.audio, // Direct MP3 URL from Jamendo
                artworkUrl: track.image || track.album_image,
            };
        });

    } catch (error) {
        console.error('Jamendo API fetch error:', error);
        // Throw the error to be caught in HomeContent
        throw error;
    }
}

// Better mood detection using multiple track properties
function determineMood(track: any): string {
    const tags = (track.tags || '').toLowerCase();
    const name = (track.name || '').toLowerCase();

    // Check for sleep/calm indicators
    if (tags.includes('ambient') || tags.includes('meditation') ||
        tags.includes('sleep') || name.includes('sleep') ||
        tags.includes('relax') || name.includes('relax')) {
        return 'sleep';
    }

    // Check for focus indicators
    if (tags.includes('instrumental') || tags.includes('study') ||
        tags.includes('focus') || name.includes('study') ||
        tags.includes('classical') || tags.includes('piano')) {
        return 'focus';
    }

    // Check for calm indicators
    if (tags.includes('acoustic') || tags.includes('chill') ||
        tags.includes('calm') || name.includes('calm') ||
        tags.includes('peaceful') || tags.includes('soft')) {
        return 'calm';
    }

    // Check for recharge indicators
    if (tags.includes('energy') || tags.includes('upbeat') ||
        tags.includes('motivation') || name.includes('energy') ||
        tags.includes('electronic') || tags.includes('dance')) {
        return 'recharge';
    }

    // Default based on popularity or duration
    if (track.duration > 300) { // Longer tracks = calm/sleep
        return Math.random() > 0.5 ? 'sleep' : 'calm';
    } else { // Shorter tracks = focus/recharge
        return Math.random() > 0.5 ? 'focus' : 'recharge';
    }
}