const API_KEY = process.env.EXPO_PUBLIC_FREESOUND_API_KEY || '';
const BASE_URL = process.env.EXPO_PUBLIC_FREESOUND_BASE_URL!;

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

const MIN_LONG_SOUND_DURATION = 120;

/* 
MAIN API FUNCTION WITH PROPER FILTERING
 */
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
/* 
   HOME SCREEN: MIXED SOUNDS (100+ sounds)
 */
async function fetchHomeScreenSounds(): Promise<Session[]> {
    console.log('Fetching MIXED sounds for home screen...');

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

    const pageSize = 30; // Get 30 sounds per query
    const targetCount = 100;

    for (const query of homeScreenQueries) {
        if (allSessions.length >= targetCount) {
            break; // Stop if we have enough
        }

        try {
            console.log(`Home Query: "${query}"`);

            const apiUrl = `${BASE_URL}?query=${encodeURIComponent(query)}&fields=id,name,previews,duration,tags,username,images&page_size=${pageSize}&sort=downloads_desc`;

            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Token ${API_KEY}` }
            });

            if (!response.ok) {
                console.log(`❌ Query failed: ${response.status}`);
                continue;
            }

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                console.log(`Query: No results`);
                continue;
            }

            // Transform all sounds to sessions
            const sessions = data.results
                .map((sound: any) => createSessionFromSound(sound))
                .filter((session: Session | null): session is Session =>
                    session !== null &&
                    session.duration >= MIN_LONG_SOUND_DURATION &&
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

/* 
   CATEGORY PAGES: FILTERED SOUNDS
 */
async function fetchCategorySounds(moodFilter: string): Promise<Session[]> {
    console.log(`Fetching FILTERED sounds for mood: ${moodFilter}`);

    const queryConfig = getCategoryQuery(moodFilter);
    const allSessions: Session[] = [];
    const pageSize = 50; // Get more sounds to filter from

    // Try multiple queries for this category
    for (const query of queryConfig.queries) {
        console.log(`Category query: "${query}"`);

        const apiUrl = `${BASE_URL}?query=${encodeURIComponent(query)}&fields=id,name,previews,duration,tags,username,images&page_size=${pageSize}&sort=downloads_desc`;

        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Token ${API_KEY}` }
        });

        if (!response.ok) {
            console.log(`❌ Query failed: ${response.status}`);
            continue;
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            console.log('No results with this query');
            continue;
        }

        // Transform and filter to ensure they match the category
        const sessions = data.results
            .map((sound: any) => createSessionFromSound(sound))
            .filter((session: Session | null): session is Session =>
                session !== null &&
                session.moodId === moodFilter && // Strict category matching
                session.duration >= Math.max(
                    getMinDurationForCategory(moodFilter),
                    MIN_LONG_SOUND_DURATION
                ) &&
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

/* 
   QUERY CONFIGURATION
 */
function getCategoryQuery(moodId: string): {
    queries: string[];
    description: string;
} {
    const configs: Record<string, { queries: string[]; description: string }> = {
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
        },
        // Sound-specific categories
        rain: {
            queries: [
                'rain',
                'rainfall',
                'downpour',
                'rainstorm',
                'gentle rain',
                'heavy rain'
            ],
            description: 'Rain Sounds'
        },
        fireplace: {
            queries: [
                'fireplace',
                'fire',
                'crackling fire',
                'bonfire',
                'campfire',
                'fire crackling'
            ],
            description: 'Fireplace Sounds'
        },
        thunder: {
            queries: [
                'thunder',
                'thunderstorm',
                'lightning',
                'storm',
                'thunder and lightning',
                'thunderclap'
            ],
            description: 'Thunder & Storm'
        },
        forest: {
            queries: [
                'forest',
                'woods',
                'birds',
                'birdsong',
                'forest ambience',
                'nature sounds'
            ],
            description: 'Forest Sounds'
        },
        cafe: {
            queries: [
                'cafe',
                'coffee shop',
                'restaurant ambience',
                'people talking',
                'background chatter',
                'coffee shop ambience'
            ],
            description: 'Cafe Sounds'
        },
        bricks: {
            queries: [
                'ambient',
                'ambient music',
                'atmospheric',
                'soundscape',
                'background',
                'environmental'
            ],
            description: 'Ambient Sounds'
        },
        wind: {
            queries: [
                'wind',
                'breeze',
                'wind blowing',
                'gusty wind',
                'wind through trees',
                'howling wind'
            ],
            description: 'Wind Sounds'
        },
        night: {
            queries: [
                'night',
                'night sounds',
                'crickets',
                'night ambience',
                'nocturnal',
                'nighttime'
            ],
            description: 'Night Sounds'
        },
        water: {
            queries: [
                'water',
                'stream',
                'river',
                'waterfall',
                'flowing water',
                'babbling brook'
            ],
            description: 'Water Sounds'
        },
        ocean: {
            queries: [
                'ocean',
                'waves',
                'sea',
                'beach',
                'shore',
                'ocean waves'
            ],
            description: 'Ocean Sounds'
        }
    };

    return configs[moodId] || {
        queries: ['ambient OR nature'],
        description: 'Ambient Sounds'
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

    // Check for specific sound categories first
    if (tagString.includes('rain') || tagString.includes('rainfall') || tagString.includes('downpour')) {
        return 'rain';
    }
    if (tagString.includes('fire') || tagString.includes('fireplace') || tagString.includes('crackling')) {
        return 'fireplace';
    }
    if (tagString.includes('thunder') || tagString.includes('storm') || tagString.includes('lightning')) {
        return 'thunder';
    }
    if (tagString.includes('forest') || tagString.includes('woods') || tagString.includes('birds')) {
        return 'forest';
    }
    if (tagString.includes('cafe') || tagString.includes('coffee shop') || tagString.includes('restaurant')) {
        return 'cafe';
    }
    if (tagString.includes('wind') || tagString.includes('breeze')) {
        return 'wind';
    }
    if (tagString.includes('night') || tagString.includes('cricket')) {
        return 'night';
    }
    if (tagString.includes('water') && !tagString.includes('ocean')) {
        return 'water';
    }
    if (tagString.includes('ocean') || tagString.includes('waves') || tagString.includes('sea')) {
        return 'ocean';
    }

    // Then check mood categories
    if (tagString.includes('sleep') || tagString.includes('meditation') ||
        tagString.includes('relaxing') || tagString.includes('white noise')) {
        return duration > 300 ? 'sleep' : 'calm';
    }
    if (tagString.includes('piano') || tagString.includes('instrumental') ||
        tagString.includes('classical') || tagString.includes('study') ||
        tagString.includes('concentration') || tagString.includes('work') ||
        tagString.includes('focus') || tagString.includes('productivity')) {
        return 'focus';
    }
    if (tagString.includes('nature') || tagString.includes('calm') ||
        tagString.includes('peaceful') || tagString.includes('tranquil')) {
        return 'calm';
    }
    if (tagString.includes('energy') || tagString.includes('upbeat') ||
        tagString.includes('motivation') || tagString.includes('inspiring') ||
        tagString.includes('positive') || tagString.includes('uplifting')) {
        return 'recharge';
    }

    // Default
    return 'bricks'; // Use bricks as default for ambient sounds
}

function getMinDurationForCategory(category: string): number {
    const minDurations: Record<string, number> = {
        sleep: 60,
        focus: 60,
        calm: 60,
        recharge: 30,
        rain: 60,
        fireplace: 60,
        thunder: 60,
        forest: 60,
        cafe: 60,
        bricks: 60,
        wind: 60,
        night: 60,
        water: 60,
        ocean: 60
    };

    return minDurations[category] || 30;
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
        if (lowerName.includes('cafe') || lowerName.includes('coffee')) return 'Coffee Shop';
        if (lowerName.includes('night') || lowerName.includes('cricket')) return 'Night Sounds';

        return username ? `${username}'s Sound` : 'Ambient Sound';
    }

    // Capitalize properly
    title = title
        .split(' ')
        .slice(0, 3)
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
    const labels: Record<string, string> = {
        // Mood categories
        sleep: 'Sleep & Relaxation',
        focus: 'Focus & Concentration',
        calm: 'Calm & Nature',
        recharge: 'Energy & Motivation',
        // Sound categories
        rain: 'Rain Sounds',
        fireplace: 'Fireplace Sounds',
        thunder: 'Thunder & Storm',
        forest: 'Forest Sounds',
        cafe: 'Cafe Sounds',
        bricks: 'Ambient Sounds',
        wind: 'Wind Sounds',
        night: 'Night Sounds',
        water: 'Water Sounds',
        ocean: 'Ocean Sounds'
    };
    return labels[moodId] || 'Ambient Sounds';
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