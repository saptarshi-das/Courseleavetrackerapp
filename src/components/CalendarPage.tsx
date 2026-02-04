import { useState, useEffect } from 'react';
import { getCalendarIframeUrl } from '../services/calendar';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserPreferences } from '../services/preferences';

interface CalendarPageProps {
    isDark: boolean;
}

type CalendarView = 'month' | 'week';

export function CalendarPage({ isDark }: CalendarPageProps) {
    const { user } = useAuth();
    const [view, setView] = useState<CalendarView>('week');
    const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Real-time listener for user's selected calendar preference
    useEffect(() => {
        if (!user) return;

        setLoading(true);

        // Set up real-time listener for preferences
        const docRef = doc(db, 'userPreferences', user.uid);
        const unsubscribe = onSnapshot(
            docRef,
            (docSnap) => {
                try {
                    if (docSnap.exists()) {
                        const preferences = docSnap.data() as UserPreferences;

                        // Load selected calendar
                        if (preferences?.selectedCalendarId) {
                            setSelectedCalendarId(preferences.selectedCalendarId);
                        } else if (preferences?.calendars && preferences.calendars.length > 0) {
                            // Use first calendar if no selection
                            setSelectedCalendarId(preferences.calendars[0].id);
                        } else {
                            // Default to user's email (primary calendar)
                            setSelectedCalendarId(user.email!);
                        }

                        // Load preferred view
                        if (preferences?.calendarView) {
                            setView(preferences.calendarView);
                        }
                    } else {
                        // No preferences document exists yet, use default
                        setSelectedCalendarId(user.email!);
                    }
                } catch (error) {
                    console.error('Error processing calendar preference:', error);
                    // Fallback to user's email
                    setSelectedCalendarId(user.email!);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Error listening to calendar preference:', error);
                // Fallback to user's email
                setSelectedCalendarId(user.email!);
                setLoading(false);
            }
        );

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [user]);

    // Save view preference when it changes
    const handleViewChange = async (newView: CalendarView) => {
        setView(newView);

        if (!user) return;

        try {
            // Save to Firestore
            const docRef = doc(db, 'userPreferences', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(docRef, { calendarView: newView });
            } else {
                await setDoc(docRef, {
                    userId: user.uid,
                    calendarView: newView,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error('Error saving view preference:', error);
        }
    };

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
                            onClick={() => handleViewChange('month')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'month'
                                ? isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                                : isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => handleViewChange('week')}
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
