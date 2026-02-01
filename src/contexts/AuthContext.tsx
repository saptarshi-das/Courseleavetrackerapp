import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    error: string | null;
    googleAccessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

const ALLOWED_DOMAIN = 'iimranchi.ac.in';

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // Initialize from current auth state (synchronous, no delay!)
    const initialUser = auth.currentUser;
    const [user, setUser] = useState<User | null>(initialUser);
    const [loading, setLoading] = useState(!initialUser); // Only show loading if no cached user
    const [error, setError] = useState<string | null>(null);
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

    useEffect(() => {
        // Handle redirect result from mobile sign-in
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log('✅ Redirect sign-in successful:', result.user.email);

                    // Verify domain
                    const email = result.user.email || '';
                    const domain = email.split('@')[1];

                    if (domain !== ALLOWED_DOMAIN) {
                        await firebaseSignOut(auth);
                        setError(`Only ${ALLOWED_DOMAIN} email addresses are allowed.`);
                        return;
                    }

                    // Extract OAuth access token
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    if (credential?.accessToken) {
                        console.log('✅ Access token captured from redirect');
                        setGoogleAccessToken(credential.accessToken);
                        localStorage.setItem('googleAccessToken', credential.accessToken);
                    }
                }
            } catch (error: any) {
                console.error('Redirect sign-in error:', error);
                if (error.code === 'auth/unauthorized-domain') {
                    setError('This domain is not authorized. Please contact support.');
                } else {
                    setError(error.message || 'Failed to sign in.');
                }
            }
        };

        // Check for redirect result on page load
        handleRedirectResult();

        // If we already have a user from cache, validate their domain
        if (initialUser) {
            const email = initialUser.email || '';
            const domain = email.split('@')[1];

            if (domain !== ALLOWED_DOMAIN) {
                // Invalid domain, sign them out
                firebaseSignOut(auth);
                setUser(null);
                setError(`Only ${ALLOWED_DOMAIN} email addresses are allowed.`);
            }
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // Verify the user's email domain
                const email = currentUser.email || '';
                const domain = email.split('@')[1];

                if (domain === ALLOWED_DOMAIN) {
                    setUser(currentUser);
                    setError(null);
                } else {
                    // Sign out users from unauthorized domains
                    firebaseSignOut(auth);
                    setUser(null);
                    setError(`Only ${ALLOWED_DOMAIN} email addresses are allowed.`);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load stored access token from localStorage
    useEffect(() => {
        if (user) {
            const storedToken = localStorage.getItem('googleAccessToken');
            if (storedToken) {
                setGoogleAccessToken(storedToken);
            }
        } else {
            // Clear token when user signs out
            setGoogleAccessToken(null);
            localStorage.removeItem('googleAccessToken');
        }
    }, [user]);

    const signInWithGoogle = async () => {
        try {
            setError(null);

            // Detect mobile devices
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                // Use redirect flow for mobile (avoid popup issues)
                console.log('📱 Mobile detected, using redirect flow');
                await signInWithRedirect(auth, googleProvider);
                // Note: This will redirect away from the page
                // The result will be handled in useEffect with getRedirectResult
                return;
            }

            // Use popup flow for desktop
            console.log('💻 Desktop detected, using popup flow');
            const result = await signInWithPopup(auth, googleProvider);

            // Double-check domain after sign in
            const email = result.user.email || '';
            const domain = email.split('@')[1];

            if (domain !== ALLOWED_DOMAIN) {
                await firebaseSignOut(auth);
                throw new Error(`Only ${ALLOWED_DOMAIN} email addresses are allowed.`);
            }

            // Extract OAuth access token for Google Calendar API
            const credential = GoogleAuthProvider.credentialFromResult(result);
            console.log('🔐 OAuth Credential:', credential);

            if (credential?.accessToken) {
                console.log('✅ Access token captured:', credential.accessToken.substring(0, 20) + '...');
                setGoogleAccessToken(credential.accessToken);
                // Store in localStorage for persistence across page reloads
                localStorage.setItem('googleAccessToken', credential.accessToken);

                // Decode token to verify scopes (for debugging)
                try {
                    const tokenParts = credential.accessToken.split('.');
                    if (tokenParts.length > 1) {
                        const payload = JSON.parse(atob(tokenParts[1]));
                        console.log('🔍 Token scopes:', payload.scope);
                    }
                } catch (e) {
                    console.log('ℹ️ Could not decode token (normal for opaque tokens)');
                }
            } else {
                console.warn('⚠️ No access token in credential!');
            }

        } catch (err: any) {
            console.error('Sign in error:', err);

            // Handle specific error cases
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign in was cancelled.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Pop-up was blocked. Please allow pop-ups for this site.');
            } else if (err.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized. Please add it to Firebase authorized domains.');
            } else {
                setError(err.message || 'Failed to sign in with Google.');
            }
            throw err;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setError(null);
        } catch (err: any) {
            console.error('Sign out error:', err);
            setError('Failed to sign out.');
            throw err;
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        signOut,
        error,
        googleAccessToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
