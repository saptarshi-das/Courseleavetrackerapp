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
            let targetRef: React.RefObject<HTMLButtonElement>;

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
                bottom: '32px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50,
            }}
        >
            <div
                className="flex items-center gap-8 px-12 py-6 rounded-full shadow-2xl transition-all duration-300"
                style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                }}
            >
                {/* Sliding Pill Background */}
                <div
                    className="rounded-full bg-white/20 backdrop-blur-sm"
                    style={{
                        position: 'absolute',
                        height: '50px',
                        left: `${pillStyle.left + 10}px`,
                        width: `${pillStyle.width - 18}px`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        pointerEvents: 'none',
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
                        className={`transition-all duration-300 ${activeSection === 'home' ? 'text-white' : 'text-gray-500'
                            }`}
                        strokeWidth={2.5}
                    />
                    {activeSection === 'home' && (
                        <span
                            className="text-white font-semibold text-xl whitespace-nowrap"
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
                        className={`transition-all duration-300 ${activeSection === 'calendar' ? 'text-white' : 'text-gray-500'
                            }`}
                        strokeWidth={2.5}
                    />
                    {activeSection === 'calendar' && (
                        <span
                            className="text-white font-semibold text-xl whitespace-nowrap"
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
                        className={`transition-all duration-300 ${activeSection === 'settings' ? 'text-white' : 'text-gray-500'
                            }`}
                        strokeWidth={2.5}
                    />
                    {activeSection === 'settings' && (
                        <span
                            className="text-white font-semibold text-xl whitespace-nowrap"
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
