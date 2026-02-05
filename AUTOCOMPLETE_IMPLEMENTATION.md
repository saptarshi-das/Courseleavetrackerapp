# Calendar-Based Course Name Autocomplete

## Overview
Implemented autocomplete suggestions for course names based on unique course names extracted from the user's selected Google Calendar, rather than from existing courses in the term.

## Changes Made

### 1. New File: `src/services/calendarEvents.ts`
Created utility functions to:
- **`getCalendarEvents()`**: Fetches calendar events from Google Calendar API using an access token and calendar ID
- **`extractUniqueCourseNames()`**: Parses calendar event summaries and extracts unique course names
  - Handles various formats: "PT-1-3", "SA-B", "BEDM-B", "Fintech", etc.
  - Removes time patterns (e.g., "10:45am -", "12:30 - 2pm")
  - Removes location suffixes while keeping the main course name
  - Filters out very short names (< 2 characters)
  - Returns sorted, unique course names

### 2. Updated `src/App.tsx`
- Added imports:
  ```tsx
  import { getUserPreferences } from './services/preferences';
  import { getCalendarEvents, extractUniqueCourseNames } from './services/calendarEvents';
  ```
  
- Added state:
  ```tsx
  const [calendarCourseNames, setCalendarCourseNames] = useState<string[]>([]);
  ```

- Added useEffect to fetch calendar events:
  - Runs when user logs in
  - Gets selected calendar ID from user preferences
  - Fetches events from Google Calendar API
  - Extracts unique course names
  - Stores in `calendarCourseNames` state

- Passed `calendarCourseNames` prop to both `TermCard` instances (current term and past terms)

### 3. Updated `src/components/TermCard.tsx`
- Added `calendarCourseNames?: string[]` to `TermCardProps` interface
- Updated function signature to accept `calendarCourseNames`
- Changed `AddCourseButton` prop from:
  ```tsx
  existingCourseNames={courses.map(c => c.name)}
  ```
  to:
  ```tsx
  existingCourseNames={calendarCourseNames || []}
  ```

### 4. Existing `src/components/AddCourseButton.tsx`
- No changes needed! Already handles `existingCourseNames` prop
- Shows suggestions when input field is focused or when user types
- Filters suggestions based on user input
- Allows clicking on suggestions to auto-fill the form

## Data Flow

1. **User logs in** → App.tsx
2. **Fetch user preferences** → Get selected calendar ID
3. **Fetch calendar events** → Google Calendar API
4. **Extract course names** → Parse event summaries
5. **Store in state** → `calendarCourseNames`
6. **Pass to TermCard** → `calendarCourseNames` prop
7. **Pass to AddCourseButton** → `existingCourseNames` prop
8. **Show suggestions** → When user opens "Add Course" modal

## Example Course Names Extracted

From calendar events like:
- "10:45am - PT-1-3" → "PT-1-3" (if first word) or course name before location
- "SA-B 12:30 - 2pm PT-1-2" → "SA-B"
- "BEDM-B 3 - 4:30pm PT-2-4" → "BEDM-B"
- "Fintech- 3 - 4:30pm PT-2-4" → "Fintech-"
- "Fintech- 6:30 - 8pm PT-2-4" → "Fintech-"

Results in unique suggestions: ["BEDM-B", "Fintech-", "PT-1-3", "SA-B"]

## Benefits

1. **Accurate suggestions**: Based on actual calendar events, not previously added courses
2. **No duplicates**: Only unique course names are shown
3. **Smart parsing**: Handles various calendar event formats
4. **Automatic updates**: Refreshes when user logs in
5. **Clean UX**: Same autocomplete interface as before

## Future Enhancements

- Cache calendar events to reduce API calls
- Add manual refresh button
- Parse course sections (e.g., "A", "B") separately
- Handle recurring events more intelligently
- Add time-based filtering (e.g., only current semester events)
