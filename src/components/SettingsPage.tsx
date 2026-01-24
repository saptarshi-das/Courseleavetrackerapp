import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Info } from 'lucide-react';

interface SettingsPageProps {
    isDark: boolean;
}

export function SettingsPage({ isDark }: SettingsPageProps) {
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
                <div className="flex items-center gap-4 mb-4">
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="w-16 h-16 rounded-full ring-2 ring-indigo-500"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.displayName || 'User'}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user.email}
                        </p>
                    </div>
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
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
            >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
            </button>
        </div>
    );
}
