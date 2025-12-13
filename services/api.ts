// services/api.ts
const FREESOUND_API_KEY = 'EJPFkrS7ZjLIwX14CQyVPZw3gDmqNqEd17nUz4TY';

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

/* ============================================================================
   MAIN API FUNCTION WITH PROPER FILTERING
============================================================================ */
export async function fetchSoundEffects(moodFilter?: string): Promise<Session[]> {
    try {
        console.log(`🔍 fetchSoundEffects called with moodFilter: ${moodFilter || 'none (home screen)'}`);

        if (moodFilter) {
            // FOR CATEGORY PAGES: Get filtered sounds for specific mood
            return await fetchCategorySounds(moodFilter);
        } else {
            // FOR HOME SCREEN: Get diverse mixed sounds
            return await fetchHomeScreenSounds();
        }

    } catch (error) {
        console.error('💥 Freesound API error:', error);
        return []; // Return empty array on error - NO FALLBACKS
    }
}

/* ============================================================================
   HOME SCREEN: MIXED SOUNDS (100+ sounds)
============================================================================ */
async function fetchHomeScreenSounds(): Promise<Session[]> {
    console.log('🏠 Fetching MIXED sounds for home screen...');

    const allSessions: Session[] = [];

    // Define multiple diverse queries to get variety
    const homeScreenQueries = [
        'nature OR rain OR forest OR birds',
        'piano OR instrumental OR ambient',
        'ocean OR waves OR water',
        'meditation OR relaxing OR calm',
        'focus OR study OR concentration',
        'fire OR fireplace OR crackling',
        'city OR urban OR traffic',
        'animals OR wildlife',
        'wind OR leaves OR trees',
        'music OR soundscape',
        'thunder OR storm',
        'river OR stream OR waterfall',
        'space OR cosmic',
        'library OR coffee OR shop',
        'beach OR shore OR seaside'
    ];

    // We'll make multiple requests with smaller page sizes to get variety
    const pageSize = 30; // Get 30 sounds per query
    const targetCount = 100; // Target 100+ sounds

    for (const query of homeScreenQueries) {
        if (allSessions.length >= targetCount) {
            break; // Stop if we have enough
        }

        try {
            console.log(`📡 Home Query: "${query}"`);

            const apiUrl = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&fields=id,name,previews,duration,tags,username,images&page_size=${pageSize}&sort=downloads_desc`;

            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Token ${FREESOUND_API_KEY}` }
            });

            if (!response.ok) {
                console.log(`❌ Query failed: ${response.status}`);
                continue;
            }

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                console.log(`📭 Query: No results`);
                continue;
            }

            // Transform all sounds to sessions
            const sessions = data.results
                .map((sound: any) => createSessionFromSound(sound))
                .filter((session: Session | null): session is Session =>
                    session !== null &&
                    session.duration >= 30 && // Minimum 30 seconds
                    !!session.soundUrl &&
                    !!session.title &&
                    session.duration <= 3600 // Maximum 1 hour
                );

            console.log(`✅ Query: ${sessions.length} valid sounds`);
            allSessions.push(...sessions);

        } catch (error) {
            console.log(`⚠️ Query error:`, error);
            continue;
        }
    }

    // Deduplicate and shuffle for variety
    const uniqueSessions = deduplicateSessions(allSessions);

    // Shuffle array for random mixed experience
    const shuffledSessions = shuffleArray(uniqueSessions);

    console.log(`🏁 Home screen: ${shuffledSessions.length} mixed sounds ready`);

    return shuffledSessions;
}

/* ============================================================================
   CATEGORY PAGES: FILTERED SOUNDS
============================================================================ */
async function fetchCategorySounds(moodFilter: string): Promise<Session[]> {
    console.log(`🎯 Fetching FILTERED sounds for mood: ${moodFilter}`);

    const queryConfig = getCategoryQuery(moodFilter);
    const allSessions: Session[] = [];
    const pageSize = 50; // Get more sounds to filter from

    // Try multiple queries for this category
    for (const query of queryConfig.queries) {
        console.log(`🔍 Category query: "${query}"`);

        const apiUrl = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&fields=id,name,previews,duration,tags,username,images&page_size=${pageSize}&sort=downloads_desc`;

        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Token ${FREESOUND_API_KEY}` }
        });

        if (!response.ok) {
            console.log(`❌ Query failed: ${response.status}`);
            continue;
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            console.log('📭 No results with this query');
            continue;
        }

        // Transform and filter to ensure they match the category
        const sessions = data.results
            .map((sound: any) => createSessionFromSound(sound))
            .filter((session: Session | null): session is Session =>
                session !== null &&
                session.moodId === moodFilter && // Strict category matching
                session.duration >= getMinDurationForCategory(moodFilter) &&
                session.duration <= 3600 &&
                !!session.soundUrl &&
                !!session.title
            );

        console.log(`✅ Found ${sessions.length} sounds for ${moodFilter}`);
        allSessions.push(...sessions);

        // Stop if we have enough
        if (allSessions.length >= 30) {
            break;
        }
    }

    // Deduplicate
    const uniqueSessions = deduplicateSessions(allSessions);

    console.log(`🏁 Category ${moodFilter}: ${uniqueSessions.length} filtered sounds ready`);
    return uniqueSessions.slice(0, 30); // Limit to 30 for category pages
}

/* ============================================================================
   QUERY CONFIGURATION
============================================================================ */
function getCategoryQuery(moodId: string): {
    queries: string[];
    description: string;
} {
    const configs = {
        sleep: {
            queries: [
                'rain OR thunder OR storm',
                'ocean OR waves OR sea',
                '"white noise" OR "pink noise"',
                'sleep OR relaxing OR meditation',
                'rainfall OR downpour',
                'thunderstorm OR lightning'
            ],
            description: 'Sleep & Relaxation'
        },
        focus: {
            queries: [
                'piano OR instrumental',
                'study OR concentration',
                '"lo-fi" OR "background music"',
                'focus OR work OR productivity',
                'classical OR minimalist',
                'ambient OR electronic'
            ],
            description: 'Focus & Concentration'
        },
        calm: {
            queries: [
                'nature OR forest OR birds',
                'stream OR waterfall OR river',
                'fire OR fireplace OR crackling',
                'calm OR peaceful OR tranquil',
                'garden OR park',
                'wind OR breeze'
            ],
            description: 'Calm & Nature'
        },
        recharge: {
            queries: [
                'energy OR upbeat OR energetic',
                'motivation OR inspiring',
                'positive OR uplifting',
                'morning OR awakening',
                'happy OR joyful',
                'power OR strength'
            ],
            description: 'Energy & Motivation'
        }
    };

    return configs[moodId as keyof typeof configs] || {
        queries: ['ambient OR nature'],
        description: 'Ambient'
    };
}

/* ============================================================================
   SOUND TRANSFORMATION
============================================================================ */
function createSessionFromSound(sound: any): Session | null {
    // Check for preview URL
    const previewUrl = sound.previews?.['preview-hq-mp3'] || sound.previews?.['preview-lq-mp3'];
    if (!previewUrl) {
        return null;
    }

    const duration = sound.duration || 180;
    const tags = sound.tags || [];

    // Determine mood based on tags and duration
    const moodId = determineMoodFromTags(tags, duration);

    return {
        id: sound.id.toString(),
        title: cleanSoundTitle(sound.name, sound.username),
        durationLabel: formatDurationLabel(duration, moodId),
        duration: duration,
        moodId: moodId,
        category: getCategoryLabel(moodId),
        soundUrl: previewUrl,
        artworkUrl: getArtworkUrl(sound.images),
    };
}

function determineMoodFromTags(tags: string[], duration: number): string {
    const tagString = tags.join(' ').toLowerCase();

    // Check each category in priority order
    if (tagString.includes('rain') || tagString.includes('ocean') || tagString.includes('waves') ||
        tagString.includes('thunder') || tagString.includes('storm') ||
        tagString.includes('white noise') || tagString.includes('pink noise') ||
        tagString.includes('sleep') || tagString.includes('meditation')) {
        return duration > 300 ? 'sleep' : 'calm';
    }

    if (tagString.includes('piano') || tagString.includes('instrumental') ||
        tagString.includes('classical') || tagString.includes('study') ||
        tagString.includes('concentration') || tagString.includes('work') ||
        tagString.includes('focus') || tagString.includes('productivity')) {
        return 'focus';
    }

    if (tagString.includes('nature') || tagString.includes('forest') ||
        tagString.includes('birds') || tagString.includes('stream') ||
        tagString.includes('waterfall') || tagString.includes('river') ||
        tagString.includes('fire') || tagString.includes('fireplace') ||
        tagString.includes('calm') || tagString.includes('peaceful')) {
        return 'calm';
    }

    if (tagString.includes('energy') || tagString.includes('upbeat') ||
        tagString.includes('motivation') || tagString.includes('inspiring') ||
        tagString.includes('positive') || tagString.includes('uplifting') ||
        tagString.includes('happy') || tagString.includes('joyful')) {
        return 'recharge';
    }

    // Default based on duration
    return duration > 600 ? 'sleep' : 'calm';
}

function getMinDurationForCategory(category: string): number {
    const minDurations = {
        sleep: 60,     // 1 minute for sleep
        focus: 60,     // 1 minute for focus
        calm: 60,      // 1 minute for calm
        recharge: 30   // 30 seconds for recharge
    };

    return minDurations[category as keyof typeof minDurations] || 30;
}

/* ============================================================================
   UTILITY FUNCTIONS
============================================================================ */
function cleanSoundTitle(rawName: string, username?: string): string {
    if (!rawName) return username ? `${username}'s Sound` : 'Nature Sound';

    // Basic cleaning
    let title = rawName
        .replace(/\.[a-z0-9]{2,4}$/i, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // If title is too weird, create descriptive one based on content
    if (title.length < 3 || title.split(' ').length > 8) {
        const lowerName = rawName.toLowerCase();
        if (lowerName.includes('rain')) return 'Gentle Rain';
        if (lowerName.includes('ocean') || lowerName.includes('wave')) return 'Ocean Waves';
        if (lowerName.includes('piano')) return 'Piano Music';
        if (lowerName.includes('forest') || lowerName.includes('bird')) return 'Forest Birds';
        if (lowerName.includes('fire')) return 'Crackling Fire';
        if (lowerName.includes('city') || lowerName.includes('urban')) return 'City Ambience';
        if (lowerName.includes('wind')) return 'Gentle Wind';
        if (lowerName.includes('thunder') || lowerName.includes('storm')) return 'Thunderstorm';
        if (lowerName.includes('stream') || lowerName.includes('river')) return 'Flowing Water';
        if (lowerName.includes('study') || lowerName.includes('focus')) return 'Study Music';

        return username ? `${username}'s Sound` : 'Ambient Sound';
    }

    // Capitalize properly
    title = title
        .split(' ')
        .slice(0, 4)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return title;
}

function formatDurationLabel(durationSeconds: number, moodId: string): string {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.floor(durationSeconds % 60);
    const category = getCategoryLabel(moodId);

    return `${minutes}:${seconds.toString().padStart(2, '0')} • ${category}`;
}

function getCategoryLabel(moodId: string): string {
    const labels = {
        sleep: 'Sleep & Relaxation',
        focus: 'Focus & Concentration',
        calm: 'Calm & Nature',
        recharge: 'Energy & Motivation'
    };
    return labels[moodId as keyof typeof labels] || 'Ambient';
}

function getArtworkUrl(images: any): string | undefined {
    return images?.spectral_m || images?.waveform_m;
}

function deduplicateSessions(sessions: Session[]): Session[] {
    const seen = new Set<string>();
    return sessions.filter(session => {
        const key = `${session.title}_${Math.floor(session.duration)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}