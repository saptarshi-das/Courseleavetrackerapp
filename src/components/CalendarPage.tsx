import { useState } from 'react';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

interface CalendarPageProps {
    isDark: boolean;
}

type CalendarView = 'month' | 'week';

export function CalendarPage({ isDark }: CalendarPageProps) {
    const [currentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('week');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const baseCalendarUrl = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FKolkata&showPrint=0&showTitle=0&showTz=0&src=c2FwdGFyc2hpLmRhc2kyMUBpaW1yYW5jaGkuYWMuaW4&src=Y18xOWY1ZTNhOWJjZDU2ZTU4YjkyYTFhNmJiMDZiNzM1NTgxOGZlMjIzNDk0MjA0OGE0NzkzMjUzNjIxYmQxODZkQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y18yYjU4MTk3M2E4Yzk4ODdlMjM2YTk2MGEyZTJkMWZhMzdjOWNiMTQ5ZDM5MmI4MDBjNWQ3MjIwM2Q4MDViMDMxQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=ZW4uaW5kaWFuI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&src=Y19jbGFzc3Jvb20xNTE5MzAzOUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23039be5&color=%237cb342&color=%23795548&color=%230b8043&color=%23202124";

    const calendarUrl = view === 'week'
        ? `${baseCalendarUrl}&mode=WEEK`
        : `${baseCalendarUrl}&mode=MONTH`;

    return (
        <div className="pb-4">
            {/* Header */}
            <div className="mb-4">
                {/* View Toggle and Open Button */}
                <div className="flex items-center justify-between">
                    {/* Toggle Switch */}
                    <div className="flex items-center">
                        <div className={`flex p-1 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
                            <button
                                onClick={() => setView('month')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex-1 ${
                                    view === 'month'
                                        ? isDark 
                                            ? 'bg-white text-gray-900 shadow-sm' 
                                            : '!bg-gray-900 !text-white shadow-sm'
                                        : isDark 
                                            ? 'text-gray-400 hover:text-gray-300' 
                                            : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setView('week')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex-1 ${
                                    view === 'week'
                                        ? isDark 
                                            ? 'bg-white text-gray-900 shadow-sm' 
                                            : '!bg-gray-900 !text-white shadow-sm'
                                        : isDark 
                                            ? 'text-gray-400 hover:text-gray-300' 
                                            : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Week
                            </button>
                        </div>
                    </div>

                    {/* Open Calendar Button */}
                    <Button
                        variant={isDark ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                        asChild
                    >
                        <a
                            href={calendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Google Calendar
                        </a>
                    </Button>
                </div>
            </div>

            {/* Google Calendar Iframe */}
            <div
                className="shadow-lg"
                style={{ position: 'relative' }}
            >
                <iframe
                    key={view} // Force re-render when view changes
                    src={calendarUrl}
                    className="rounded-xl"
                    style={{
                        border: 'none',
                        width: '100%',
                        height: 'calc(100vh - 340px)',
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
