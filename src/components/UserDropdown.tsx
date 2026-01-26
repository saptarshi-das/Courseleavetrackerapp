import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, ChevronDown } from 'lucide-react';

interface UserDropdownProps {
    isDark: boolean;
}

export const UserDropdown = ({ isDark }: UserDropdownProps) => {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

    if (!user) return null;

    // Update dropdown position when opened or window resizes
    useEffect(() => {
        const updatePosition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const dropdownWidth = 240; // w-60 = 15rem = 240px

                setDropdownPosition({
                    top: rect.bottom + 8,
                    right: rect.left, // Store left edge position, will use it to calculate in style
                });
            }
        };

        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition);
        }

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error('Sign out failed:', err);
        }
    };

    // Calculate left position so right edge aligns with button's right edge
    const dropdownWidth = 240; // w-60 = 15rem = 240px
    const buttonRect = buttonRef.current?.getBoundingClientRect();
    const leftPosition = buttonRect ? buttonRect.right - dropdownWidth : 0;

    return (
        <>
            {/* Dropdown Trigger Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all duration-200 ${isDark
                    ? 'hover:bg-white/10'
                    : 'hover:bg-gray-100'
                    }`}
            >
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full ring-2 ring-white/20"
                    />
                ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        }`}>
                        <User className="w-4 h-4 text-white" />
                    </div>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''
                    } ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>

            {/* Dropdown Menu - Fixed positioned to avoid expanding header */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: `${dropdownPosition.top}px`,
                        left: `${leftPosition}px`,
                    }}
                    className={`w-60 rounded-xl shadow-2xl border z-[100] ${isDark
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                        }`}
                >
                    {/* User Info - No profile picture, just text */}
                    <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                        <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                            {user.displayName || 'User'}
                        </p>
                        <p className={`text-sm break-words ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {user.email}
                        </p>
                    </div>

                    {/* Sign Out Button */}
                    <div className="p-2">
                        <button
                            onClick={handleSignOut}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isDark
                                    ? 'bg-red-500/90 text-white hover:bg-red-600'
                                    : 'hover:bg-red-50 text-red-600'
                                }`}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
