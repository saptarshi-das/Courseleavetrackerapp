# Margin - Course Leave Tracker App

## Project Overview
React + TypeScript PWA for IIM Ranchi students to track course leaves. Built with Vite, Firebase Auth + Firestore, Tailwind CSS, and Radix UI components. Features offline-first architecture with real-time multi-device sync.

## Architecture

### Core Data Flow (Cache-First Pattern)
1. **Initial Load**: App synchronously loads from `localStorage` (instant UI), then syncs with Firestore in background
2. **User Actions**: All mutations save to `localStorage` immediately + Firestore asynchronously (non-blocking)
3. **Multi-device Sync**: Firestore real-time listeners update UI when changes occur on other devices
4. **Offline Mode**: Full functionality without network; changes queue and sync when reconnected

See [src/firebase/database.ts](src/firebase/database.ts) for `DatabaseService` implementation. The `initialize()` method returns cached data synchronously - never await it.

### State Management
- **Auth**: [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - Firebase auth with domain restriction (`@iimranchi.ac.in` only)
- **Courses**: Managed in [src/App.tsx](src/App.tsx) via `useState`, synced through `DatabaseService.saveCourses()`
- **Theme**: `isDark` state in App.tsx, persisted to localStorage

### Component Architecture
- **App.tsx**: Root component, manages courses state, theme, navigation (`home|calendar|settings`)
- **CourseList**: Main course management UI with +/- buttons and delete confirmation modals
- **Dashboard**: Read-only stats view (total courses, average leaves, highest course)
- **LoginPage**: Google OAuth with domain validation (client + server side)
- **UserDropdown**: Profile menu with sign-out (uses Radix UI Dropdown)

## Firebase Integration

### Environment Variables (Required)
Create `.env` from [.env.example](.env.example). All vars prefixed `VITE_FIREBASE_*`. Never commit actual values.

### Authentication Flow
1. [src/firebase/config.ts](src/firebase/config.ts): Google provider with `hd: 'iimranchi.ac.in'` hint
2. [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx): Domain validation on sign-in (reject non-IIM emails)
3. [src/components/LoginPage.tsx](src/components/LoginPage.tsx): Error handling for popup blocked/cancelled

### Database Operations
```typescript
// CORRECT - Non-blocking initialization
const dbService = createDatabaseService(userId);
const cachedCourses = dbService.initialize(setCourses); // Returns immediately
setCourses(cachedCourses); // UI shows cached data instantly

// CORRECT - All mutations go through DatabaseService
dbService.saveCourses(updatedCourses); // Saves to localStorage + Firestore

// WRONG - Never await initialization (breaks cache-first pattern)
await dbService.initialize(setCourses); // ❌ Adds unnecessary latency
```

## UI Components (Radix + Custom)

### Import Pattern
All UI components in [src/components/ui/](src/components/ui/) use versioned aliases from [vite.config.ts](vite.config.ts):
```tsx
import { Slot } from "@radix-ui/react-slot@1.1.2"; // Note version in import
```

### Styling Conventions
- **Tailwind-first**: Use utility classes, avoid custom CSS unless necessary
- **Dark Mode**: All components receive `isDark` prop for theme switching
- **Conditional Classes**: Pattern: `${isDark ? 'dark-classes' : 'light-classes'}`
- **Color Scheme**: Red for over-limit courses, green for add, red for minus/delete, gradient backgrounds

### Common Components
- **Buttons**: Use Lucide React icons with `size={18}` prop
- **Modals**: Fixed overlay `fixed inset-0 z-50` with `backdrop-blur-sm`
- **Cards**: `rounded-2xl` corners, `shadow-md` or `shadow-lg` for elevation

## Development Workflows

### Local Development
```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build to dist/
```

### PWA Features
- **Service Worker**: [public/service-worker.js](public/service-worker.js) - Cache-first for static assets, network-first for Firestore
- **Update Prompt**: [src/components/UpdatePrompt.tsx](src/components/UpdatePrompt.tsx) - Shows "Update Available" when new SW detected
- **Install Prompt**: [src/components/PWAPrompt.tsx](src/components/PWAPrompt.tsx) - iOS/Android install instructions

### Deploy to Vercel
Project is deployed on Vercel with automatic deployments:
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing handled automatically by Vercel

## Key Conventions

### TypeScript Patterns
- **Course Interface**: Defined in [src/App.tsx](src/App.tsx) - `id`, `name`, `shortName?`, `leaves`, `maxLeaves`
- **Component Props**: Always type with inline interface (e.g., `CourseListProps`)
- **Firebase Types**: Use `DBCourse` from database.ts, map to `Course` in App.tsx

### Performance Optimizations
- **Lazy Firestore**: `enableIndexedDbPersistence()` called in `setTimeout` to avoid blocking initial render
- **Scroll Effects**: Header fade uses `requestAnimationFrame` indirectly via scroll listener
- **Service Worker**: `skipWaiting()` for immediate updates, excludes Firebase API calls from cache

### Security
- **Domain Restriction**: Two-layer validation (GoogleAuthProvider hint + server-side check in AuthContext)
- **Auto Sign-out**: Invalid domains automatically signed out in `onAuthStateChanged`
- **Firestore Rules**: Must be configured in Firebase Console (see [DATABASE_IMPLEMENTATION.md](DATABASE_IMPLEMENTATION.md))

## Critical Files Reference
- [src/firebase/database.ts](src/firebase/database.ts) - Network-first data sync with offline support
- [src/App.tsx](src/App.tsx) - Main app logic, course operations, theme management
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - Authentication with domain validation
- [vite.config.ts](vite.config.ts) - Versioned package aliases for Radix UI components
- [public/service-worker.js](public/service-worker.js) - PWA caching strategy

## Common Pitfalls
1. **Never block on database init**: `initialize()` returns cached data synchronously
2. **Always save through DatabaseService**: Don't update localStorage directly
3. **Include isDark prop**: All custom components need theme support
4. **Use versioned imports**: Radix UI imports must include `@version` suffix
5. **Handle offline state**: Show indicators when network unavailable (see OfflineIndicator component)
