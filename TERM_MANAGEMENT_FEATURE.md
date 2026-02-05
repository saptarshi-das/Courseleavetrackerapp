# Term Management Feature Implementation - FINAL

## Overview
Added comprehensive term management to the Margin app, allowing users to organize courses by academic terms (1-9) with improved UX where courses are added directly within term cards.

## Key Features Implemented

### 1. **Add Term Button**
- New component: `AddTermButton.tsx`
- Allows users to create terms with:
  - Term number selection (1-9)
  - **Start date: Exact date picker** (HTML date input)
  - **End date: Month + Week selection (1-4 weeks only)**
- Validates no duplicate terms can be created

### 2. **Term Card Component** ⭐ NEW
- Component: `TermCard.tsx`
- Displays for the selected term:
  - Term number (e.g., "Term 1")
  - Formatted start date (e.g., "Jan 15, 2026")
  - End date as "Month, Week" (e.g., "April, 3rd Week")
  - **Add Course button built-in** (inside the card)
  - Delete term button (trash icon)
- The Add Course button is **only accessible within the term card**

### 3. **Updated Data Models**
- **Course Interface** - Added optional `termNumber` field for backward compatibility
- **Term Interface**:
  - `id`, `termNumber`, `createdAt`
  - `startDate: string` - ISO date format (YYYY-MM-DD)
  - `endMonth: number` - 0-11 (January = 0)
  - `endWeek: number` - 0-3 (1st-4th week)

### 4. **Database Service Updates**
- Added term management methods:
  - `getTerms()` - Get terms from local storage
  - `saveTerms()` - Save terms with network-first strategy
  - `getLocalTerms()`, `saveLocalTerms()` - Local storage helpers
- Updated `syncWithServer()` to sync terms alongside courses

### 5. **Migration Support for Existing Users**
When users with existing courses load the app:
- **Migration Prompt** appears with:
  - Dropdown to select term number (1-9) to assign existing courses to
  - Option "Assign to Term X" - Creates the term if it doesn't exist with defaults
  - Option "I'll Add Terms First" - Dismisses prompt, lets user add terms manually
- Automatically creates the selected term with sensible defaults:
  - Start date: Current date
  - End date: 3 months from now, 4th week

### 6. **Updated UI Flow**
- **No term selector dropdown** - Only one term can be worked on at a time
- **Term Card** displays the current term with:
  - Term info (number, dates)
  - Add Course button (inside the card)
  - Delete term button
- **Dashboard** shows courses from the displayed term
- **Course List** shows courses from the displayed term
- **Add Term** button at bottom to create new terms

### 7. **Updated User Flow**
1. **New Users**: 
   - Click "Add Term" → Enter term details → Term card appears
   - Click "Add Course" inside term card → Add courses to that term
   
2. **Existing Users**: 
   - See migration prompt
   - Choose term number for existing courses from dropdown (1-9)
   - Term is auto-created with defaults
   - Can then work with that term or add more terms

3. **Working with Multiple Terms**:
   - Currently shows one term at a time (latest by termNumber)
   - Can add more terms with Add Term button
   - Can delete terms with trash icon in term card

## Files Modified/Created

1. **src/components/AddTermButton.tsx** (MODIFIED)
   - Changed start date to exact date picker
   - End date uses month + week (1-4 only)
   - Updated function signature

2. **src/components/TermCard.tsx** (NEW)
   - Displays term information
   - Contains Add Course button inside
   - Optional delete term functionality

3. **src/firebase/database.ts** (MODIFIED)
   - Updated `Term` interface with `startDate` string
   - Added term management methods
   - Updated sync logic for terms

4. **src/App.tsx** (MODIFIED)
   - Added term state management
   - Updated `addTerm()` to accept `startDate` string
   - Updated `migrateLegacyCourses()` with new Term structure
   - Replaced term selector dropdown with `TermCard` component
   - Removed standalone Add Course button (now inside TermCard)
   - Import and use TermCard

## Data Structure

### Term Interface
```typescript
interface Term {
  id: string;
  termNumber: number;
  startDate: string;        // ISO date: "2026-01-15"
  endMonth: number;         // 0-11 (Jan = 0)
  endWeek: number;          // 0-3 (1st-4th week)
  createdAt: number;
}
```

### Example Term Data
```json
{
  "id": "1738666517890",
  "termNumber": 1,
  "startDate": "2026-01-15",
  "endMonth": 3,
  "endWeek": 2,
  "createdAt": 1738666517890
}
```
This represents: Term 1, starting Jan 15, 2026, ending in April, 3rd week.

## Data Persistence

- **Local Storage Keys**:
  - `courses` - Course data with termNumber
  - `terms` - Term data
  - `lastSync` - Sync timestamp

- **Firestore Structure**:
  ```
  userCourses/{userId}/
    - courses: Course[]
    - terms: Term[]
    - updatedAt: Timestamp
  ```

## UI/UX Improvements
- ✅ Add Course button **only inside term cards** (not standalone)
- ✅ Exact date picker for start date (better precision)
- ✅ Month + week for end date (accounts for uncertain end dates)
- ✅ Clean, card-based UI for terms
- ✅ One term displayed at a time (focused workflow)
- ✅ Delete term with trash icon

## Backward Compatibility

- `termNumber` is optional in Course interface
- Existing courses without `termNumber` trigger migration prompt
- Users can choose to assign existing courses to any term (1-9)
- No data is lost during migration

## Testing Checklist

- [x] New user: Add term → Term card appears with Add Course button
- [x] New user: Add course inside term card
- [x] Existing user: Migration prompt appears
- [x] Existing user: Select term, courses assigned correctly
- [x] Term dates display correctly (start = exact, end = month + week)
- [x] Delete term deletes courses in that term
- [x] Offline mode works (localStorage fallback)
- [x] Cloud sync works (Firestore)
