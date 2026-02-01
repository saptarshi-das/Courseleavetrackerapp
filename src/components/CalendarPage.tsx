import { useState, useEffect } from 'react';
import { getUserPreferences } from '../services/preferences';
import { getCalendarIframeUrl } from '../services/calendar';
import { useAuth } from '../contexts/AuthContext';

interface CalendarPageProps {
    isDark: boolean;
}

type CalendarView = 'month' | 'week';

export function CalendarPage({ isDark }: CalendarPageProps) {
    const { user } = useAuth();
    const [view, setView] = useState<CalendarView>('week');
    const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Load user's selected calendar preference
    useEffect(() => {
        if (!user) return;

        const loadCalendarPreference = async () => {
            try {
                setLoading(true);

                // Get user's preferences
                const preferences = await getUserPreferences(user.uid);

                if (preferences?.selectedCalendarId) {
                    setSelectedCalendarId(preferences.selectedCalendarId);
                } else if (preferences?.calendars && preferences.calendars.length > 0) {
                    // Use first calendar if no selection
                    setSelectedCalendarId(preferences.calendars[0].id);
                } else {
                    // Default to user's email (primary calendar)
                    setSelectedCalendarId(user.email!);
                }
            } catch (error) {
                console.error('Error loading calendar preference:', error);
                // Fallback to user's email
                setSelectedCalendarId(user.email!);
            } finally {
                setLoading(false);
            }
        };

        loadCalendarPreference();
    }, [user]);

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading calendar...
                </div>
            </div>
        );
    }

    if (!selectedCalendarId) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No calendar selected. Please select a calendar in Settings.
                </div>
            </div>
        );
    }

    const calendarUrl = getCalendarIframeUrl(selectedCalendarId, view);

    return (
        <div className="pb-4">
            {/* View Toggle */}
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <div className={`flex rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'month'
                                    ? isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                                    : isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'week'
                                    ? isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                                    : isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}
                        >
                            Week
                        </button>
                    </div>

                    <a
                        href={calendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} underline`}
                    >
                        Open in new tab
                    </a>
                </div>
            </div>

            {/* Google Calendar Iframe */}
            <div
                className={`rounded-xl overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                style={{ position: 'relative' }}
            >
                <iframe
                    key={`${selectedCalendarId}-${view}`}
                    src={calendarUrl}
                    style={{
                        border: 'none',
                        width: '100%',
                        height: 'calc(100vh - 300px)',
                        minHeight: '600px',
                        display: 'block',
                    }}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    title="Google Calendar"
                />
            </div>

            {/* Bottom Spacer */}
            <div style={{ height: '120px' }} />
        </div>
    );
}
