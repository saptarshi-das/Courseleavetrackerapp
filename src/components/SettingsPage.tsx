import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Info, Sun, Moon } from 'lucide-react';

interface SettingsPageProps {
    isDark: boolean;
    onToggleTheme: () => void;
}

export function SettingsPage({ isDark, onToggleTheme }: SettingsPageProps) {
    const { user, signOut } = useAuth();

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
