import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface CalendarPageProps {
    isDark: boolean;
}

export function CalendarPage({ isDark }: CalendarPageProps) {
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
                Calendar
            </h2>

            {/* Coming Soon Card */}
            <div
                className={`rounded-2xl p-8 shadow-lg text-center ${isDark
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                    }`}
            >
                <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'
                        }`}>
                        <CalendarIcon className={`w-12 h-12 ${isDark ? 'text-indigo-400' : 'text-indigo-600'
                            }`} />
                    </div>
                </div>

                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                    Calendar Coming Soon
                </h3>

                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    View your class schedule and manage your attendance calendar here.
                </p>

                {/* Features List */}
                <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                    <p className={`text-xs font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Upcoming Features:
                    </p>

                    <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            <Clock className="w-4 h-4" />
                            <span>Weekly class schedule view</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            <CalendarIcon className="w-4 h-4" />
                            <span>Mark attended classes</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            <CalendarIcon className="w-4 h-4" />
                            <span>Monthly attendance overview</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
