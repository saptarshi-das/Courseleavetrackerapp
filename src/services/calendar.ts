/**
 * Calendar service for managing Google Calendar integration
 * Uses direct fetch to Google Calendar API (no gapi dependency)
 */

export interface Calendar {
    id: string;
    summary: string;
    description?: string;
    backgroundColor: string;
    foregroundColor: string;
    primary?: boolean;
}

/**
 * Fetches the list of calendars the user has access to using direct API call
 */
export async function getUserCalendars(accessToken: string): Promise<Calendar[]> {
    try {
        console.log('📅 Fetching calendars with token:', accessToken?.substring(0, 20) + '...');

        // Direct fetch to Google Calendar API
        const response = await fetch(
            'https://www.googleapis.com/calendar/v3/users/me/calendarList',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
            }
        );

        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ API Error:', errorData);

            if (response.status === 401) {
                throw new Error('Calendar access unauthorized. Please sign out and sign in again.');
            }

            if (response.status === 403) {
                throw new Error('Calendar API not enabled or insufficient permissions. Please enable Google Calendar API in Google Cloud Console.');
            }

            throw new Error(errorData.error?.message || `Failed to fetch calendars (${response.status})`);
        }

        const data = await response.json();
        console.log('✅ Calendar API response:', data);

        const calendars: Calendar[] = (data.items || []).map((cal: any) => ({
            id: cal.id,
            summary: cal.summary || cal.id,
            description: cal.description,
            backgroundColor: cal.backgroundColor || '#4285f4',
            foregroundColor: cal.foregroundColor || '#ffffff',
            primary: cal.primary || false,
        }));

        console.log(`✅ Found ${calendars.length} calendars:`, calendars.map(c => c.summary));
        return calendars;

    } catch (error: any) {
        console.error('❌ Error fetching calendars:', error);
        throw error;
    }
}

/**
 * Generates the iframe URL for a specific calendar
 */
export function getCalendarIframeUrl(
    calendarId: string,
    view: 'month' | 'week' = 'week',
    timezone: string = 'Asia/Kolkata',
    additionalCalendars: string[] = []
): string {
    const encodedCalendarId = encodeURIComponent(calendarId);
    const mode = view === 'week' ? 'WEEK' : 'MONTH';

    // Base URL with primary calendar
    let url = `https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=${timezone}&showPrint=0&showTitle=0&showTz=0&mode=${mode}&src=${encodedCalendarId}`;

    // Add additional calendars if provided
    additionalCalendars.forEach(calId => {
        url += `&src=${encodeURIComponent(calId)}`;
    });

    return url;
}

/**
 * Parse calendar IDs from a Google Calendar embed URL
 */
export function parseCalendarIdsFromUrl(embedUrl: string): string[] {
    const srcParams = embedUrl.match(/src=([^&]*)/g);
    if (!srcParams) return [];

    return srcParams.map(param => {
        const id = param.replace('src=', '');
        return decodeURIComponent(id);
    });
}
