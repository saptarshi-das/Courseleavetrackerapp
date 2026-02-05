/**
 * Fetch calendar events and extract unique course names
 */

export interface CalendarEvent {
    id: string;
    summary: string;
    start: any;
    end: any;
    description?: string;
}

/**
 * Fetches calendar events from Google Calendar API
 */
export async function getCalendarEvents(
    accessToken: string,
    calendarId: string,
    timeMin?: string,
    timeMax?: string
): Promise<CalendarEvent[]> {
    try {
        const params = new URLSearchParams({
            maxResults: '2500', // Get many events
            singleEvents: 'true',
            orderBy: 'startTime',
        });

        if (timeMin) params.append('timeMin', timeMin);
        if (timeMax) params.append('timeMax', timeMax);

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }
}

/**
 * Extract unique course names from calendar events
 * Handles formats like "PT-1-3", "SA-B", "BEDM-B", "Fintech", etc.
 */
export function extractUniqueCourseNames(events: CalendarEvent[]): string[] {
    const courseNames = new Set<string>();

    events.forEach(event => {
        if (!event.summary) return;

        let courseName = event.summary.trim();

        // Remove common time patterns (e.g., "10:45am -", "12:30 - 2pm")
        courseName = courseName.replace(/\d{1,2}:\d{2}(am|pm)?\s*-\s*(\d{1,2}:\d{2}(am|pm)?)?/gi, '');

        // Remove location patterns (e.g., "PT-1-2", "PT-1-3") from the end
        // Keep the main course name before the location
        const parts = courseName.split(/\s+/);

        // Take the first significant part as the course name
        if (parts.length > 0) {
            let mainPart = parts[0].trim();

            // If there's a dash and it looks like a course code, keep the whole thing
            // Examples: "SA-B", "BEDM-B"
            if (mainPart.includes('-') && mainPart.length <= 10) {
                courseNames.add(mainPart);
            } else if (mainPart.length > 0) {
                // Otherwise just use the first word
                courseNames.add(mainPart);
            }
        }
    });

    // Filter out very short names (likely not real courses)
    return Array.from(courseNames)
        .filter(name => name.length >= 2)
        .sort();
}
