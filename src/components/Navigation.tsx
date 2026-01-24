import { Home, Settings } from 'lucide-react';

interface NavigationProps {
    isDark: boolean;
    activeSection: 'home' | 'settings';
    onSectionChange: (section: 'home' | 'settings') => void;
}

export function Navigation({ isDark, activeSection, onSectionChange }: NavigationProps) {
    return (
        <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div
                className="flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300"
                style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                {/* Home Button */}
                <button
                    onClick={() => onSectionChange('home')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${activeSection === 'home'
                            ? 'bg-white/20 backdrop-blur-sm'
                            : 'hover:bg-white/5'
                        }`}
                    style={{
                        transform: activeSection === 'home' ? 'scale(1.05)' : 'scale(1)',
                    }}
                >
                    <Home
                        size={20}
                        className={`transition-all duration-300 ${activeSection === 'home'
                                ? 'text-white'
                                : 'text-gray-500'
                            }`}
                        strokeWidth={2.5}
                    />
                    {activeSection === 'home' && (
                        <span
                            className="text-white font-medium text-sm whitespace-nowrap animate-fade-in"
                            style={{
                                animation: 'slideIn 0.3s ease-out',
                            }}
                        >
                            Home
                        </span>
                    )}
                </button>

                {/* Settings Button */}
                <button
                    onClick={() => onSectionChange('settings')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${activeSection === 'settings'
                            ? 'bg-white/20 backdrop-blur-sm'
                            : 'hover:bg-white/5'
                        }`}
                    style={{
                        transform: activeSection === 'settings' ? 'scale(1.05)' : 'scale(1)',
                    }}
                >
                    <Settings
                        size={20}
                        className={`transition-all duration-300 ${activeSection === 'settings'
                                ? 'text-white'
                                : 'text-gray-500'
                            }`}
                        strokeWidth={2.5}
                    />
                    {activeSection === 'settings' && (
                        <span
                            className="text-white font-medium text-sm whitespace-nowrap animate-fade-in"
                            style={{
                                animation: 'slideIn 0.3s ease-out',
                            }}
                        >
                            Settings
                        </span>
                    )}
                </button>
            </div>
        </nav>
    );
}
