const API_KEY = process.env.EXPO_PUBLIC_FREESOUND_API_KEY || '';
const BASE_URL = process.env.EXPO_PUBLIC_FREESOUND_BASE_URL!;

export async function fetchFreesoundData(query: string, pageSize: number) {
    const apiUrl = `${BASE_URL}?query=${encodeURIComponent(
        query
    )}&fields=id,name,previews,duration,tags,username,images&page_size=${pageSize}&sort=downloads_desc`;

    const response = await fetch(apiUrl, {
        headers: { Authorization: `Token ${API_KEY}` }
    });

    if (!response.ok) {
        return null;
    }

    return response.json();
}
