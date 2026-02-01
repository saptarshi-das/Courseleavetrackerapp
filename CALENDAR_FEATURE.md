# Calendar Selection Feature

## Overview
Users can now select which Google Calendar to display in the Calendar page. This feature allows managing multiple calendars and switching between them.

## How It Works

### 1. Authentication
When users sign in with Google, the app now requests calendar read permission:
- Scope: `https://www.googleapis.com/auth/calendar.readonly`
- This allows the app to display Google Calendar iframes for the user's calendars

### 2. Calendar Management (Settings Page)

#### Default Calendar
- On first use, the app automatically sets the user's primary calendar (their email address)
- Example: `user@iimranchi.ac.in`

#### Adding Calendars
1. Go to **Settings** →**Calendar Display** → Click **"Add Calendar"**
2. Enter:
   - **Calendar Name**: A friendly name (e.g., "MBA Term 6 Classes", "Birthdays")
   - **Calendar ID**: The Google Calendar ID

#### Finding Your Calendar ID
1. Open [Google Calendar](https://calendar.google.com)
2. Click the 3 dots next to the calendar name
3. Select **"Settings and sharing"**
4. Scroll to **"Integrate calendar"**
5. Copy the **"Calendar ID"**
   - For your primary calendar: your email address
   -For shared calendars: looks like `c_abc123@group.calendar.google.com`

#### Removing Calendars
- Click the **X** button next to any calendar (except if it's the only one)
- At least one calendar must remain in the list

#### Selecting Active Calendar
- Use the dropdown in Settings to choose which calendar to display
- Selection is saved automatically to Firestore
- The Calendar page will immediately update to show the selected calendar

### 3. Calendar Display (Calendar Page)

The Calendar page shows:
- **View Toggle**: Switch between Month and Week views
- **Google Calendar Iframe**: Embeds the selected calendar
- **"Open in new tab"** link: Opens the full Google Calendar website

The iframe automatically updates when:
- You change the selected calendar in Settings
- You switch between Month/Week views

## Technical Implementation

### Services

#### `src/services/calendar.ts`
```typescript
- getCalendarIframeUrl(calendarId, view): string
  Generates Google Calendar embed URL for the specified calendar

- parseCalendarIdsFromUrl(embedUrl): string[]
  Parses calendar IDs from an embed URL
```

#### `src/services/preferences.ts`
```typescript
- UserPreferences interface:
  - selectedCalendarId: string          // Currently active calendar
  - calendars: {id, name}[]             // List of managed calendars
  - theme: 'light' | 'dark'
  - userId: string

- getUserPreferences(userId): Promise<UserPreferences>
- saveUserPreferences(userId, preferences): Promise<void>
```

### Components

#### CalendarPage
- Loads user's selected calendar from Firestore
- Falls back to user's email if no preference exists
- Displays the calendar in an iframe with Month/Week toggle

#### SettingsPage
- Manages calendar list (add/remove/select)
- Stores preferences in Firestore
- Shows helper text for finding Calendar IDs

## Data Storage (Firestore)

Collection: `userPreferences`
Document ID: `{userId}`

```json
{
  "userId": "user123",
  "selectedCalendarId": "user@iimranchi.ac.in",
  "calendars": [
    {
      "id": "user@iimranchi.ac.in",
      "name": "Primary Calendar"
    },
    {
      "id": "c_abc12345@group.calendar.google.com",
      "name": "MBA Term 6 Classes"
    }
  ],
  "theme": "dark",
  "createdAt": "2026-02-01T12:00:00.000Z",
  "updatedAt": "2026-02-01T12:30:00.000Z"
}
```

## User Flow

1. **First Time User**:
   - Signs in with Google (grants calendar permission)
   - Default: Primary calendar (their email) is preselected
   - Can view calendar immediately

2. **Adding a Shared Calendar**:
   - User goes to Settings
   - Clicks "Add Calendar"
   - Finds Calendar ID from Google Calendar settings
   - Pastes ID and gives it a name
   - Saves successfully
   - Can now select it from dropdown

3. **Switching Calendars**:
   - User selects different calendar from dropdown in Settings
   - Preference saves automatically
   - Calendar page updates to show new calendar

## Limitations

- **OAuth Tokens**: Firebase doesn't expose Google OAuth tokens directly in the web SDK
- **Current Approach**: Uses Google Calendar embed URLs (public/shared calendars)
- **Alternative for Private Calendars**: Would require Firebase Functions as a proxy to call Google Calendar API with stored refresh tokens

## Future Enhancements

1. **Auto-fetch calendars**: Use Firebase Functions to call Google Calendar API and auto-populate calendar list
2. **Multi-calendar view**: Display multiple calendars in the same iframe
3. **Calendar colors**: Store and apply custom colors for each calendar
4. **Event creation**: Add ability to create events from the app

## Security Notes

- Calendar IDs are stored in Firestore with user-level security rules
- Only the authenticated user can read/write their own preferences
- The embed iframe uses Google's auth system (user must be signed into Google)
