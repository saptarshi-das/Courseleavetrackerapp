import {
    collection,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    deleteDoc,
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from './config';

// Use MODE instead of DEV to avoid TS issues
const IS_DEV = import.meta.env.MODE === 'development';

export interface Course {
    id: string;
    name: string;
    shortName?: string;
    leaves: number;
    maxLeaves: number;
    termNumber?: number; // Optional for backward compatibility
    updatedAt?: number;
}

export interface Term {
    id: string;
    termNumber: number;
    startDate: string; // ISO date string
    endMonth: number;
    endWeek: number;
    createdAt: number;
}

const COURSES_COLLECTION = 'userCourses';
const LOCAL_STORAGE_KEY = 'courses';
const LAST_SYNC_KEY = 'lastSync';

/**
 * Database service with network-first strategy and offline support
 * - If online: Syncs with Firestore and updates localStorage
 * - If offline: Uses localStorage immediately
 * - Automatically syncs when connection is restored
 */
export class DatabaseService {
    private userId: string;
    private unsubscribe: (() => void) | null = null;
    private isOnline: boolean = navigator.onLine;

    constructor(userId: string) {
        this.userId = userId;
        this.setupOnlineListener();
    }

    /**
     * Listen for online/offline events
     */
    private setupOnlineListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            if (IS_DEV) {
                console.log('📡 Connection restored - syncing with server...');
            }
            // When back online, sync local changes to server
            this.syncLocalToServer();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            if (IS_DEV) {
                console.log('📴 Connection lost - using local storage');
            }
        });
    }

    /**
     * Get user's document reference
     */
    private getUserDocRef() {
        return doc(db, COURSES_COLLECTION, this.userId);
    }

    /**
     * Get courses from localStorage
     */
    private getLocalCourses(): Course[] {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    }

    /**
     * Save courses to localStorage
     */
    private saveLocalCourses(courses: Course[]) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(courses));
            localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Initialize with cache-first strategy (INSTANT LOAD)
     * Returns localStorage data immediately (synchronous), then syncs with server in background
     */
    initialize(onCoursesUpdate: (courses: Course[]) => void): Course[] {
        // 1. Get local data synchronously - NO WAITING!
        const localCourses = this.getLocalCourses();

        // Only log in development
        if (IS_DEV) {
            console.log('⚡ Loaded from cache instantly:', localCourses.length, 'courses');
        }

        // 2. If offline, just use local data
        if (!this.isOnline) {
            if (IS_DEV) {
                console.log('📴 Offline - using cached data only');
            }
            return localCourses;
        }

        // 3. Sync with server in the background (non-blocking)
        this.syncWithServer(localCourses, onCoursesUpdate);

        // 4. Return local data immediately - UI shows instantly!
        return localCourses;
    }

    /**
     * Background sync with server (non-blocking)
     */
    private async syncWithServer(localCourses: Course[], onCoursesUpdate: (courses: Course[]) => void) {
        try {
            const docRef = this.getUserDocRef();
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const serverCourses = docSnap.data().courses || [];
                const serverTerms = docSnap.data().terms || [];
                const serverTimestamp = docSnap.data().updatedAt?.toMillis() || 0;
                const localTimestamp = parseInt(localStorage.getItem(LAST_SYNC_KEY) || '0');

                // Use server data if it's newer
                if (serverTimestamp >= localTimestamp) {
                    if (IS_DEV) {
                        console.log('📡 Server has newer data - updating UI');
                    }
                    this.saveLocalCourses(serverCourses);
                    this.saveLocalTerms(serverTerms);
                    onCoursesUpdate(serverCourses);
                } else {
                    // Local data is newer, sync to server
                    if (IS_DEV) {
                        console.log('💾 Local data is newer - syncing to server');
                    }
                    await this.saveCourses(localCourses);
                }
            } else {
                // No server data, upload local data if any
                if (localCourses.length > 0) {
                    if (IS_DEV) {
                        console.log('🔄 Uploading local data to server');
                    }
                    await this.saveCourses(localCourses);
                }
            }

            // Set up real-time listener after initial sync
            this.setupRealtimeListener(onCoursesUpdate);
        } catch (error) {
            console.error('⚠️ Background sync failed (local data still works):', error);
        }
    }

    /**
     * Set up real-time listener for course changes
     */
    private setupRealtimeListener(onCoursesUpdate: (courses: Course[]) => void) {
        if (this.unsubscribe) {
            this.unsubscribe(); // Clean up existing listener
        }

        const docRef = this.getUserDocRef();
        this.unsubscribe = onSnapshot(
            docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    const courses = docSnap.data().courses || [];
                    if (IS_DEV) {
                        console.log('🔔 Real-time update from server');
                    }
                    this.saveLocalCourses(courses);
                    onCoursesUpdate(courses);
                }
            },
            (error) => {
                console.error('Error in real-time listener:', error);
            }
        );
    }

    /**
     * Save courses (network-first, with offline fallback)
     */
    async saveCourses(courses: Course[]): Promise<void> {
        // Always save to localStorage first for immediate feedback
        this.saveLocalCourses(courses);

        // Try to save to server if online
        if (!this.isOnline) {
            if (IS_DEV) {
                console.log('📴 Offline - saved to local storage only');
            }
            return;
        }

        try {
            const docRef = this.getUserDocRef();
            await setDoc(docRef, {
                courses,
                updatedAt: Timestamp.now(),
                userId: this.userId
            });
            if (IS_DEV) {
                console.log('✅ Saved to server and local storage');
            }
        } catch (error) {
            console.error('⚠️ Failed to save to server (saved locally):', error);
            // Data is already in localStorage, so app continues to work
        }
    }

    /**
     * Get terms from localStorage
     */
    private getLocalTerms(): Term[] {
        try {
            const saved = localStorage.getItem('terms');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error reading terms from localStorage:', error);
            return [];
        }
    }

    /**
     * Save terms to localStorage
     */
    private saveLocalTerms(terms: Term[]) {
        try {
            localStorage.setItem('terms', JSON.stringify(terms));
        } catch (error) {
            console.error('Error saving terms to localStorage:', error);
        }
    }

    /**
     * Get terms (synchronous from local storage)
     */
    getTerms(): Term[] {
        return this.getLocalTerms();
    }

    /**
     * Save terms (network-first, with offline fallback)
     */
    async saveTerms(terms: Term[]): Promise<void> {
        // Always save to localStorage first
        this.saveLocalTerms(terms);

        // Try to save to server if online
        if (!this.isOnline) {
            if (IS_DEV) {
                console.log('📴 Offline - terms saved to local storage only');
            }
            return;
        }

        try {
            const docRef = this.getUserDocRef();
            const docSnap = await getDoc(docRef);
            const existingData = docSnap.exists() ? docSnap.data() : {};

            await setDoc(docRef, {
                ...existingData,
                terms,
                updatedAt: Timestamp.now(),
                userId: this.userId
            });
            if (IS_DEV) {
                console.log('✅ Terms saved to server and local storage');
            }
        } catch (error) {
            console.error('⚠️ Failed to save terms to server (saved locally):', error);
        }
    }

    /**
     * Sync local changes to server (called when coming back online)
     */
    private async syncLocalToServer() {
        const localCourses = this.getLocalCourses();
        if (localCourses.length > 0) {
            try {
                await this.saveCourses(localCourses);
                if (IS_DEV) {
                    console.log('✅ Synced local changes to server');
                }
            } catch (error) {
                if (IS_DEV) {
                    console.error('⚠️ Failed to sync local changes:', error);
                }
            }
        }
    }

    /**
     * Clean up listeners
     */
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
}

/**
 * Helper function to create a database service for a user
 */
export function createDatabaseService(userId: string): DatabaseService {
    return new DatabaseService(userId);
}
