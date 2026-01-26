import { Home, Settings, Calendar } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface NavigationProps {
    isDark: boolean;
    activeSection: 'home' | 'calendar' | 'settings';
    onSectionChange: (section: 'home' | 'calendar' | 'settings') => void;
}

export function Navigation({ isDark, activeSection, onSectionChange }: NavigationProps) {
    const homeRef = useRef<HTMLButtonElement>(null);
    const calendarRef = useRef<HTMLButtonElement>(null);
    const settingsRef = useRef<HTMLButtonElement>(null);

    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const updatePill = () => {
            let targetRef = homeRef; // Initialize with default

            switch (activeSection) {
                case 'home':
                    targetRef = homeRef;
                    break;
                case 'calendar':
                    targetRef = calendarRef;
                    break;
                case 'settings':
                    targetRef = settingsRef;
                    break;
                default:
                    targetRef = homeRef;
            }

            if (targetRef.current) {
                const navContainer = targetRef.current.parentElement;
                if (navContainer) {
                    const containerRect = navContainer.getBoundingClientRect();
                    const buttonRect = targetRef.current.getBoundingClientRect();

                    setPillStyle({
                        left: buttonRect.left - containerRect.left,
                        width: buttonRect.width,
                    });
                }
            }
        };

        // Update immediately
        updatePill();

        // Update after a short delay to account for text animation
        const timeout = setTimeout(updatePill, 50);

        return () => clearTimeout(timeout);
    }, [activeSection]);

    return (
        <nav
            style={{
                position: 'fixed',
                bottom: '25px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                pointerEvents: 'auto',
                width: 'auto',
                willChange: 'transform',
            }}
        >
            {/* Blur Layer - Radiates outwards */}
            <div
                style={{
                    position: 'absolute',
                    inset: '-20px',
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.6) 0%, rgba(45, 45, 45, 0.6) 100%)',
                    borderRadius: '9999px',
                    filter: 'blur(25px)',
                    opacity: 0.7,
                    zIndex: -1,
                }}
            />

            <div
                className="flex items-center gap-8 px-12 py-6 rounded-full shadow-2xl transition-all duration-300"
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
                        : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    border: isDark
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {/* Sliding Pill Background */}
                <div
                    className="rounded-full backdrop-blur-sm"
                    style={{
                        position: 'absolute',
                        height: '50px',
                        left: `${pillStyle.left + 10}px`,
                        width: `${pillStyle.width - 20}px`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        pointerEvents: 'none',
                        background: isDark
                            ? 'rgba(31, 41, 55, 0.15)'  // Dark gray for white navbar
                            : 'rgba(255, 255, 255, 0.2)',  // White for dark navbar
                    }}
                />

                {/* Home Button */}
                <button
                    ref={homeRef}
                    onClick={() => onSectionChange('home')}
                    className="flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-300 relative z-10"
                    style={{
                        transform: activeSection === 'home' ? 'scale(1.05)' : 'scale(1)',
                    }}
                >
                    <Home
                        size={32}
                        className={`transition-all duration-300 ${activeSection === 'home'
                            ? (isDark ? 'text-gray-900' : 'text-white')
                            : 'text-gray-400'
                            }`}
                        strokeWidth={2}
                    />
                    {activeSection === 'home' && (
                        <span
                            className={`font-semibold text-xl whitespace-nowrap ${isDark ? 'text-gray-900' : 'text-white'
                                }`}
                            style={{
                                animation: 'slideIn 0.3s ease-out',
                            }}
                        >
                            Home
                        </span>
                    )}
                </button>

                {/* Calendar Button */}
                <button
                    ref={calendarRef}
                    onClick={() => onSectionChange('calendar')}
                    className="flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-300 relative z-10"
                    style={{
                        transform: activeSection === 'calendar' ? 'scale(1.05)' : 'scale(1)',
                    }}
                >
                    <Calendar
                        size={32}
                        className={`transition-all duration-300 ${activeSection === 'calendar'
                            ? (isDark ? 'text-gray-900' : 'text-white')
                            : 'text-gray-400'
                            }`}
                        strokeWidth={2}
                    />
                    {activeSection === 'calendar' && (
                        <span
                            className={`font-semibold text-xl whitespace-nowrap ${isDark ? 'text-gray-900' : 'text-white'
                                }`}
                            style={{
                                animation: 'slideIn 0.3s ease-out',
                            }}
                        >
                            Calendar
                        </span>
                    )}
                </button>

                {/* Settings Button */}
                <button
                    ref={settingsRef}
                    onClick={() => onSectionChange('settings')}
                    className="flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-300 relative z-10"
                    style={{
                        transform: activeSection === 'settings' ? 'scale(1.05)' : 'scale(1)',
                    }}
                >
                    <Settings
                        size={32}
                        className={`transition-all duration-300 ${activeSection === 'settings'
                            ? (isDark ? 'text-gray-900' : 'text-white')
                            : 'text-gray-400'
                            }`}
                        strokeWidth={2}
                    />
                    {activeSection === 'settings' && (
                        <span
                            className={`font-semibold text-xl whitespace-nowrap ${isDark ? 'text-gray-900' : 'text-white'
                                }`}
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
