import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface UserPreferences {
    selectedCalendarId?: string;
    calendars?: { id: string; name: string }[];
    calendarsLastFetched?: string; // ISO timestamp of last calendar fetch
    theme?: 'light' | 'dark';
    userId: string;
}

/**
 * Get user preferences from Firestore
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
        const docRef = doc(db, 'userPreferences', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserPreferences;
        }
        return null;
    } catch (error) {
        console.error('Error getting user preferences:', error);
        return null;
    }
}

/**
 * Save user preferences to Firestore
 */
export async function saveUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
): Promise<void> {
    try {
        const docRef = doc(db, 'userPreferences', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Update existing preferences
            await updateDoc(docRef, {
                ...preferences,
                updatedAt: new Date().toISOString(),
            });
        } else {
            // Create new preferences document
            await setDoc(docRef, {
                userId,
                ...preferences,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
    } catch (error) {
        console.error('Error saving user preferences:', error);
        throw error;
    }
}

/**
 * Update selected calendar preference
 */
export async function updateSelectedCalendar(
    userId: string,
    calendarId: string
): Promise<void> {
    await saveUserPreferences(userId, { selectedCalendarId: calendarId });
}
