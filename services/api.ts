// services/api.ts - SIMPLE WORKING VERSION
const FREESOUND_API_KEY = 'EJPFkrS7ZjLIwX14CQyVPZw3gDmqNqEd17nUz4TY'; // ← MUST HAVE YOUR ACTUAL KEY HERE

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

export async function fetchSoundEffects(moodFilter?: string): Promise<Session[]> {
    try {
        console.log(`Fetching from Freesound API for mood: ${moodFilter || 'all'}...`);

        const { query } = buildQueryForMood(moodFilter);
        console.log('Generated query:', query);

        const allSessions: Session[] = [];

        // Try multiple simple queries if first one fails
        const testQueries = [
            query,  // First try the mood-specific query
            'query=nature',  // Fallback 1
            'query=ambient', // Fallback 2
            'query=rain'     // Fallback 3
        ];

        for (const testQuery of testQueries) {
            console.log(`Trying query: ${testQuery}`);

            const apiUrl = `https://freesound.org/apiv2/search/text/?${testQuery}&fields=id,name,previews,duration,tags,username&page_size=100&sort=downloads_desc`;
            console.log('API URL:', apiUrl);

            const response = await fetch(
                apiUrl,
                {
                    headers: {
                        'Authorization': `Token ${FREESOUND_API_KEY}`
                    }
                }
            );

            console.log('Response status:', response.status, response.statusText);

            if (!response.ok) {
                console.log(`Query failed with status: ${response.status}`);
                continue; // Try next query
            }

            const data = await response.json();
            console.log('API found:', data.count, 'sounds');

            if (!data.results || data.results.length === 0) {
                console.log('No results with this query, trying next...');
                continue;
            }

            console.log(`Success! Found ${data.results.length} sounds`);

            // Transform the sounds
            const pageSessions = data.results.map((sound: any) => {
                // Freesound uses 'preview-hq-mp3' (with hyphen)
                const previewUrl = sound.previews?.['preview-hq-mp3'] || sound.previews?.['preview-lq-mp3'];
                if (!previewUrl) {
                    return null;
                }

                const duration = sound.duration || 180;
                const moodId = mapFreesoundTagsToMood(sound.tags, duration);

                return {
                    id: sound.id.toString(),
                    title: formatSoundTitle(sound.name, sound.username),
                    durationLabel: formatDurationLabel(duration, moodId),
                    duration: duration,
                    moodId: moodId,
                    category: getCategoryLabel(moodId),
                    soundUrl: previewUrl,
                    artworkUrl: sound.images?.spectral_m || sound.images?.waveform_m,
                };
            }).filter((session: Session | null): session is Session => session !== null);

            allSessions.push(...pageSessions);

            // If we got results, stop trying more queries
            if (allSessions.length > 0) {
                break;
            }
        }

        console.log(`TOTAL SOUNDS LOADED: ${allSessions.length} valid sounds`);

        // If still no sounds, try one more ultra-simple query
        if (allSessions.length === 0) {
            console.log('All queries failed, trying ultra-simple query...');
            return await fetchWithSimpleQuery();
        }

        return allSessions;

    } catch (error) {
        console.error('Freesound API fetch error:', error);
        return [];
    }
}

// ULTRA-SIMPLE FALLBACK FUNCTION
async function fetchWithSimpleQuery(): Promise<Session[]> {
    try {
        const apiUrl = `https://freesound.org/apiv2/search/text/?query=rain&fields=id,name,previews,duration,tags,username&page_size=20&sort=downloads_desc`;
        console.log('Trying ultra-simple query:', apiUrl);

        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Token ${FREESOUND_API_KEY}` }
        });

        if (!response.ok) {
            console.error('Ultra-simple query also failed');
            return [];
        }

        const data = await response.json();
        console.log('Ultra-simple query found:', data.count, 'sounds');

        if (!data.results || data.results.length === 0) {
            return [];
        }

        return data.results.slice(0, 10).map((sound: any) => {
            const previewUrl = sound.previews?.['preview-hq-mp3'] || sound.previews?.['preview-lq-mp3'];
            const duration = sound.duration || 180;

            return {
                id: sound.id.toString(),
                title: sound.name || 'Nature Sound',
                durationLabel: `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`,
                duration: duration,
                moodId: 'calm',
                category: 'Nature',
                soundUrl: previewUrl || '',
                artworkUrl: undefined,
            };
        }).filter((s: Session) => !!s.soundUrl);

    } catch (error) {
        console.error('Fallback query error:', error);
        return [];
    }
}

// SIMPLIFIED QUERY BUILDER - NO PARENTHESES, NO QUOTES
function buildQueryForMood(moodFilter?: string): { query: string } {
    // SIMPLE queries without parentheses or complex syntax
    const baseQueries: Record<string, { query: string }> = {
        sleep: {
            query: 'query=rain+ocean+waves'
        },
        focus: {
            query: 'query=instrumental+piano'
        },
        calm: {
            query: 'query=nature+forest'
        },
        recharge: {
            query: 'query=energy+upbeat'
        }
    };

    // Simple "all moods" query
    const allMoodsQuery = 'query=nature+ambient+rain';

    const config = moodFilter && baseQueries[moodFilter]
        ? baseQueries[moodFilter]
        : { query: allMoodsQuery };

    return { query: config.query };
}

// Enhanced mood mapping with duration consideration
function mapFreesoundTagsToMood(tags: string[] | undefined, duration: number): string {
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        // Default to 'calm' for short sounds, 'sleep' for long sounds
        return duration > 1200 ? 'sleep' : 'calm';
    }

    const tagString = tags.join(' ').toLowerCase();

    // Priority mapping with more specific tags
    if (tagString.includes('rain') || tagString.includes('storm') || tagString.includes('thunder')) {
        return duration > 1800 ? 'sleep' : 'calm';
    } else if (tagString.includes('ocean') || tagString.includes('waves') || tagString.includes('sea')) {
        return 'sleep';
    } else if (tagString.includes('fireplace') || tagString.includes('crackling') || tagString.includes('fire')) {
        return 'calm';
    } else if (tagString.includes('white+noise') || tagString.includes('pink+noise') || tagString.includes('ambient')) {
        return 'sleep';
    } else if (tagString.includes('focus') || tagString.includes('study') || tagString.includes('concentration')) {
        return 'focus';
    } else if (tagString.includes('instrumental') || tagString.includes('classical') || tagString.includes('piano')) {
        return duration > 900 ? 'focus' : 'calm';
    } else if (tagString.includes('energy') || tagString.includes('upbeat') || tagString.includes('motivation')) {
        return 'recharge';
    } else if (tagString.includes('forest') || tagString.includes('birds') || tagString.includes('nature')) {
        return 'calm';
    }

    return duration > 1200 ? 'sleep' : 'calm';
}

// Validate if sound meets mood duration requirements
function isValidForMood(moodId: string, duration: number): boolean {
    const minDurations: Record<string, number> = {
        sleep: 5 * 60,     // 5 minutes (was 60)
        focus: 3 * 60,     // 3 minutes (was 15)
        calm: 3 * 60,      // 3 minutes (was 30)
        recharge: 2 * 60   // 2 minutes (was 10)
    };

    return duration >= (minDurations[moodId] || 60); // Default 1 minute
}

// Clean up sound titles
function formatSoundTitle(rawName: string, username?: string): string {
    if (!rawName || rawName.trim().length === 0) {
        return username ? `${username}'s Sound` : 'Ambient Sound';
    }

    let title = rawName
        // Remove ALL file extensions and codes
        .replace(/\.[a-z0-9]{2,4}$/gi, '')  // Remove .mp3, .wav, .ogg, etc.
        .replace(/[-_]?\d+(kbps|khz|hz|bit)/gi, '')  // Remove quality codes
        .replace(/[-_]?\d{3,}x\d{3,}/g, '')  // Remove resolution like 1920x1080
        .replace(/sample[-_]\d+/gi, '')  // Remove sample_01, sample-02
        .replace(/version[-_]\d+\.\d+/gi, '')  // Remove version_1.0
        .replace(/\([^)]*\)/g, '')  // Remove anything in parentheses
        .replace(/\[[^\]]*\]/g, '')  // Remove anything in brackets
        .replace(/\b(demo|edit|mix|remix|rework|cover)\b/gi, '')  // Remove common tags
        .replace(/\b(stereo|mono|quadro|binaural|surround)\b/gi, '')  // Remove audio formats
        .replace(/\b(loop|looped|looping|repeat)\b/gi, '')  // Remove loop indicators

        // Replace underscores, dashes, dots with spaces
        .replace(/[._-]+/g, ' ')
        // Remove multiple spaces
        .replace(/\s+/g, ' ')
        .trim();

    // If title is too short or still looks like a filename
    if (title.length < 3 ||
        title.includes('www.') ||
        title.match(/^\d/) ||
        title.split(' ').length > 8) {

        // Create a descriptive title based on mood/type
        if (username) {
            // Limit username title to max 3 words
            const userTitle = `${username}'s Sound`;
            return userTitle.split(' ').slice(0, 3).join(' ');
        }

        // Check if we can extract something meaningful
        const words = title.toLowerCase().split(' ');
        if (words.includes('rain') || words.includes('thunder')) {
            return 'Gentle Rain';
        } else if (words.includes('ocean') || words.includes('wave')) {
            return 'Ocean Waves';
        } else if (words.includes('fire') || words.includes('fireplace')) {
            return 'Crackling Fire';
        } else if (words.includes('forest') || words.includes('bird')) {
            return 'Forest Birds';
        }

        return 'Nature Sound';
    }

    // NEW: Split into words and take only first 3
    const words = title.split(' ');
    const limitedWords = words.slice(0, 4); // Take only first 3 words

    // Capitalize properly (only the limited words)
    title = limitedWords
        .map(word => {
            // Don't capitalize small words in the middle (optional)
            const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for',
                'in', 'of', 'on', 'or', 'the', 'to', 'with'];
            if (smallWords.includes(word.toLowerCase()) && limitedWords.indexOf(word) > 0) {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');

    // Capitalize first word always
    if (title.length > 0) {
        title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    return title;
}
// Get proper category labels
function getCategoryLabel(moodId: string): string {
    const labels: Record<string, string> = {
        sleep: 'Sleep & Relaxation',
        focus: 'Focus & Concentration',
        calm: 'Calm & Nature',
        recharge: 'Energy & Motivation'
    };
    return labels[moodId] || 'Ambient';
}

// Helper function for duration formatting
function formatDurationLabel(durationSeconds: number, moodId: string): string {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = Math.floor(durationSeconds % 60);

    const category = getCategoryLabel(moodId);

    if (hours > 0) {
        // Format: 2:02:15 • Sleep & Relaxation
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} • ${category}`;
    } else {
        // Format: 15:30 • Focus & Concentration
        return `${minutes}:${seconds.toString().padStart(2, '0')} • ${category}`;
    }
}