import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Info, Sun, Moon, Calendar, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserCalendars, Calendar as CalendarType } from '../services/calendar';
import { getUserPreferences, saveUserPreferences } from '../services/preferences';

interface SettingsPageProps {
    isDark: boolean;
    onToggleTheme: () => void;
}

export function SettingsPage({ isDark, onToggleTheme }: SettingsPageProps) {
    const { user, googleAccessToken, signOut } = useAuth();
    const [calendars, setCalendars] = useState<CalendarType[]>([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');
    const [loadingCalendars, setLoadingCalendars] = useState(true);
    const [savingPreference, setSavingPreference] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);


    // Load calendars from cache or Google API
    const loadData = async (forceRefresh = false) => {
        if (!user || !googleAccessToken) return;

        try {
            setLoadingCalendars(true);
            setError(null);

            // Get saved preferences first (includes cached calendars)
            const preferences = await getUserPreferences(user.uid);

            let userCalendars: CalendarType[];

            // Only fetch from API if:
            // 1. No cache exists (first time), OR
            // 2. User explicitly clicked Refresh button
            if (forceRefresh || !preferences?.calendars || preferences.calendars.length === 0) {
                // Fetch from Google Calendar API
                const reason = forceRefresh ? 'Manual refresh' : 'No cached calendars found';
                console.log(`🔄 ${reason} - fetching from Google Calendar API`);
                const fetchedCalendars = await getUserCalendars(googleAccessToken);
                userCalendars = fetchedCalendars;

                const fetchTime = new Date().toISOString();
                setLastFetchTime(fetchTime);

                // Save to cache
                await saveUserPreferences(user.uid, {
                    calendars: fetchedCalendars.map(cal => ({
                        id: cal.id,
                        name: cal.summary
                    })),
                    calendarsLastFetched: fetchTime
                });
            } else {
                // Use cached calendars (no expiration - calendar list rarely changes!)
                console.log('📦 Using cached calendars (events load dynamically in iframe)');
                userCalendars = preferences.calendars.map(cal => ({
                    id: cal.id,
                    summary: cal.name,
                    backgroundColor: '#4285f4',
                    foregroundColor: '#ffffff',
                    primary: cal.id === user.email
                }));
                setLastFetchTime(preferences.calendarsLastFetched || null);
            }

            setCalendars(userCalendars);

            // Set selected calendar
            if (preferences?.selectedCalendarId) {
                setSelectedCalendarId(preferences.selectedCalendarId);
            } else {
                // Default to primary calendar
                const primaryCalendar = userCalendars.find(cal => cal.primary);
                const defaultId = primaryCalendar?.id || userCalendars[0]?.id || user.email!;
                setSelectedCalendarId(defaultId);

                // Save default selection
                await saveUserPreferences(user.uid, {
                    selectedCalendarId: defaultId
                });
            }
        } catch (error: any) {
            console.error('Error loading calendars:', error);
            setError(error.message || 'Failed to load calendars');
        } finally {
            setLoadingCalendars(false);
            setRefreshing(false);
        }
    };

    // Load calendars on mount
    useEffect(() => {
        loadData();
    }, [user, googleAccessToken]);


    const handleCalendarChange = async (calendarId: string) => {
        if (!user) return;

        try {
            setSavingPreference(true);
            setSelectedCalendarId(calendarId);
            await saveUserPreferences(user.uid, {
                selectedCalendarId: calendarId
            });
        } catch (error) {
            console.error('Error saving calendar preference:', error);
        } finally {
            setSavingPreference(false);
        }
    };

    const handleRefreshCalendars = async () => {
        if (!user || !googleAccessToken) return;
        setRefreshing(true);
        await loadData(true); // Force refresh
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error('Sign out failed:', err);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-4">
            {/* Page Title */}
            <h2
                className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{
                    fontWeight: 500,
                    textShadow: isDark
                        ? '0 0 1px rgba(255,255,255,0.5)'
                        : '0 0 1px rgba(0,0,0,0.3)'
                }}
            >
                Settings
            </h2>

            {/* User Profile Card */}
            <div
                className={`rounded-2xl p-6 shadow-lg ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}
            >
                <div className="flex items-start gap-6">
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="w-20 h-20 rounded-full ring-2 ring-indigo-500 flex-shrink-0"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-10 h-10 text-white" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.displayName || 'User'}
                        </h3>
                        <p className={`text-sm break-words ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Theme Toggle Card */}
            <div
                className={`rounded-2xl p-6 shadow-lg ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Theme
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isDark ? 'Dark mode' : 'Light mode'}
                        </p>
                    </div>
                    <button
                        onClick={onToggleTheme}
                        className={`p-4 rounded-full transition-all active:scale-95 ${isDark
                            ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                    >
                        {isDark ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                </div>
            </div>

            {/* Calendar Selection Card */}
            <div
                className={`rounded-2xl p-6 shadow-lg ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}
            >
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Calendar Display
                    </h3>
                </div>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Choose which calendar to display in the Calendar page
                </p>

                {!googleAccessToken ? (
                    <div className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ⚠️ Please sign out and sign in again to grant calendar access.
                    </div>
                ) : loadingCalendars ? (
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading your calendars...
                    </div>
                ) : error ? (
                    <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        ❌ {error}
                        <br />
                        <span className="text-xs">Please sign out and sign in again.</span>
                    </div>
                ) : calendars.length === 0 ? (
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No calendars found in your Google account.
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <select
                                value={selectedCalendarId}
                                onChange={(e) => handleCalendarChange(e.target.value)}
                                disabled={savingPreference}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white hover:border-indigo-500 focus:border-indigo-500'
                                    : 'bg-white border-gray-300 text-gray-900 hover:border-indigo-500 focus:border-indigo-500'
                                    } ${savingPreference ? 'opacity-50 cursor-wait' : ''}`}
                                style={{ outline: 'none' }}
                            >
                                {calendars.map((calendar) => (
                                    <option key={calendar.id} value={calendar.id}>
                                        {calendar.summary}{calendar.primary ? ' (Primary)' : ''}
                                    </option>
                                ))}
                            </select>
                            {savingPreference && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Found {calendars.length} calendar{calendars.length !== 1 ? 's' : ''}
                                {lastFetchTime && (
                                    <> • Last updated: {new Date(lastFetchTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                                )}
                            </p>
                            <button
                                onClick={handleRefreshCalendars}
                                disabled={refreshing}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isDark
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    } ${refreshing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                            >
                                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* App Info Card */}
            <div
                className={`rounded-2xl p-6 shadow-lg ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}
            >
                <div className="flex items-center gap-3 mb-4">
                    <Info className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        About Margin
                    </h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Track your course attendance and maximize your leaves efficiently.
                </p>
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Version 1.0.0
                    </p>
                </div>
            </div>

            {/* Sign Out Button */}
            <button
                onClick={handleSignOut}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg ${isDark
                    ? 'bg-red-500/90 text-white hover:bg-red-600'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
            >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
            </button>

            {/* Bottom Spacer - matches background */}
            <div style={{ height: '80px' }} />
        </div>
    );
}
