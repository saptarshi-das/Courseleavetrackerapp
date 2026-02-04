# Term Management Feature Implementation

## Overview
Added comprehensive term management to the Margin app, allowing users to organize courses by academic terms (1-9).

## Key Features Implemented

### 1. **Add Term Button**
- New component: `AddTermButton.tsx`
- Allows users to create terms with:
  - Term number selection (1-9)
  - Start date: Month + Week (1st-Last week)
  - End date: Month + Week (1st-Last week)
- Validates no duplicate terms can be created

### 2. **Updated Data Models**
- **Course Interface** - Added optional `termNumber` field for backward compatibility
- **Term Interface** - New interface with:
  - `id`, `termNumber`, `startMonth`, `startWeek`, `endMonth`, `endWeek`, `createdAt`

### 3. **Database Service Updates**
- Added term management methods:
  - `getTerms()` - Get terms from local storage
  - `saveTerms()` - Save terms with network-first strategy
  - `getLocalTerms()`, `saveLocalTerms()` - Local storage helpers
- Updated `syncWithServer()` to sync terms alongside courses

### 4. **Migration Support for Existing Users**
When users with existing courses load the app:
- **Migration Prompt** appears with:
  - Dropdown to select term number (1-9) to assign existing courses to
  - Option "Assign to Term X" - Creates the term if it doesn't exist
  - Option "I'll Add Terms First" - Dismisses prompt, lets user add terms manually
- Automatically creates the selected term with sensible defaults if it doesn't exist

### 5. **Term Selection & Filtering**
- **Term Selector Dropdown** - Shows when terms exist, allows switching between terms
- **Filtered Course Display**:
  - Dashboard shows only courses from selected term
  - Course List shows only courses from selected term
- Auto-selects latest term on login

### 6. **Updated User Flow**
1. **New Users**: Add terms → Add courses to those terms
2. **Existing Users**: 
   - See migration prompt
   - Choose term number for existing courses
   - Term is auto-created if needed
   - Can then add more terms/courses normally

### 7. **UI/UX Improvements**
- Add Term button with calendar icon
- Term selector shows "Term X" or "Term 0 (Legacy)" for migrated courses
- Add Course button only shows when a term is selected
- Clear visual hierarchy with yellow-bordered migration prompt

## Files Modified

1. **src/components/AddTermButton.tsx** (NEW)
   - Complete term creation UI with month/week selectors

2. **src/firebase/database.ts**
   - Added `Term` interface
   - Updated `Course` interface with `termNumber`
   - Added term management methods
   - Updated sync logic for terms

3. **src/App.tsx**
   - Added term state management (`terms`, `selectedTerm`, `migrationTermNumber`)
   - Added `addTerm()`, `deleteTerm()`, `migrateLegacyCourses()` functions
   - Updated `addCourse()` to accept optional `termNumber`
   - Added migration prompt UI with term selector
   - Added term selector dropdown
   - Filter courses by selected term in Dashboard and CourseList
   - Import and use AddTermButton

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

## Backward Compatibility

- `termNumber` is optional in Course interface
- Existing courses without `termNumber` trigger migration prompt
- Users can choose to keep existing courses by assigning them to any term
- No data is lost during migration

## Testing Recommendations

1. **New User Flow**: 
   - Create account → Add term → Add courses to term
   
2. **Existing User Migration**:
   - Users with courses but no terms see migration prompt
   - Select term number → Courses assigned + Term auto-created
   
3. **Term Switching**:
   - Create multiple terms
   - Add courses to different terms
   - Switch between terms using selector
   - Verify only relevant courses show

4. **Edge Cases**:
   - No terms, no courses (clean state)
   - Multiple terms with courses
   - Deleting a term (deletes its courses too)
   - Offline mode (localStorage fallback)
