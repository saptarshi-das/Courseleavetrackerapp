import { useState, useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { CourseList } from './components/CourseList';
import { AddCourseButton } from './components/AddCourseButton';
import { AddTermButton } from './components/AddTermButton';
import { TermCard } from './components/TermCard';
import { Dashboard } from './components/Dashboard';
import { PWAPrompt } from './components/PWAPrompt';
import { UpdatePrompt } from './components/UpdatePrompt';
import { LoginPage } from './components/LoginPage';
import { UserDropdown } from './components/UserDropdown';
import { Navigation } from './components/Navigation';
import { SettingsPage } from './components/SettingsPage';
import { CalendarPage } from './components/CalendarPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DatabaseService, createDatabaseService, Course as DBCourse, Term } from './firebase/database';
import { getUserPreferences } from './services/preferences';
import { getCalendarEvents, extractUniqueCourseNames } from './services/calendarEvents';

export interface Course {
  id: string;
  name: string;
  shortName?: string;
  leaves: number;
  maxLeaves: number;
  termNumber?: number;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [migrationTermNumber, setMigrationTermNumber] = useState('1');
  const dbServiceRef = useRef<DatabaseService | null>(null);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const [activeSection, setActiveSection] = useState<'home' | 'calendar' | 'settings'>('home');
  const [showPastTerms, setShowPastTerms] = useState(false);
  const [calendarCourseNames, setCalendarCourseNames] = useState<string[]>([]);

  // Initialize database service when user logs in
  useEffect(() => {
    if (user && !dbServiceRef.current) {
      const dbService = createDatabaseService(user.uid);
      dbServiceRef.current = dbService;

      // ⚡ CACHE-FIRST: Load instantly from localStorage (no await!)
      // Database syncs in background and updates UI if server has newer data
      const cachedCourses = dbService.initialize(setCourses);
      setCourses(cachedCourses);

      // Load terms
      const cachedTerms = dbService.getTerms();
      setTerms(cachedTerms);

      // Auto-select latest term or show migration prompt
      if (cachedTerms.length > 0) {
        const latestTerm = Math.max(...cachedTerms.map(t => t.termNumber));
        setSelectedTerm(latestTerm);
      } else if (cachedCourses.length > 0) {
        // User has courses but no terms - show migration prompt
        setShowMigrationPrompt(true);
      }

      setIsInitialized(true); // UI shows immediately!
    } else if (!user && dbServiceRef.current) {
      // Clean up when user logs out
      dbServiceRef.current.cleanup();
      dbServiceRef.current = null;
      setCourses([]);
      setTerms([]);
      setSelectedTerm(null);
      setIsInitialized(false);
    }

    // Cleanup on unmount
    return () => {
      if (dbServiceRef.current) {
        dbServiceRef.current.cleanup();
      }
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Scroll detection for header fade effect
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch calendar events and extract course names
  useEffect(() => {
    async function fetchCalendarCourseNames() {
      if (!user) return;

      try {
        // Get user preferences to find selected calendar
        const preferences = await getUserPreferences(user.uid);
        if (!preferences?.selectedCalendarId) {
          console.log('No selected calendar found');
          return;
        }

        // Get access token
        const token = await user.getIdToken();

        // Fetch calendar events
        const events = await getCalendarEvents(token, preferences.selectedCalendarId);

        // Extract unique course names
        const courseNames = extractUniqueCourseNames(events);
        setCalendarCourseNames(courseNames);

        console.log('📚 Extracted course names from calendar:', courseNames);
      } catch (error) {
        console.error('Error fetching calendar course names:', error);
      }
    }

    if (user) {
      fetchCalendarCourseNames();
    }
  }, [user]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  const addCourse = (name: string, shortName: string, maxLeaves: number, termNumber?: number) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name,
      shortName: shortName.trim() || undefined,
      leaves: 0,
      maxLeaves,
      termNumber: termNumber ?? selectedTerm ?? undefined,
    };
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);

    // Save to database (network-first, with offline fallback)
    if (dbServiceRef.current) {
      dbServiceRef.current.saveCourses(updatedCourses);
    }
  };

  const addTerm = (termNumber: number, startDate: string, endMonth: number, endWeek: number) => {
    const newTerm: Term = {
      id: Date.now().toString(),
      termNumber,
      startDate,
      endMonth,
      endWeek,
      createdAt: Date.now(),
    };
    const updatedTerms = [...terms, newTerm].sort((a, b) => b.termNumber - a.termNumber);
    setTerms(updatedTerms);
    setSelectedTerm(termNumber);

    // Save to database
    if (dbServiceRef.current) {
      dbServiceRef.current.saveTerms(updatedTerms);
    }

    // Close migration prompt if open
    setShowMigrationPrompt(false);
  };

  const deleteTerm = (termNumber: number) => {
    // Delete the term
    const updatedTerms = terms.filter(t => t.termNumber !== termNumber);
    setTerms(updatedTerms);

    // Delete all courses in that term
    const updatedCourses = courses.filter(c => c.termNumber !== termNumber);
    setCourses(updatedCourses);

    // Update selected term
    if (selectedTerm === termNumber) {
      setSelectedTerm(updatedTerms.length > 0 ? Math.max(...updatedTerms.map(t => t.termNumber)) : null);
    }

    // Save to database
    if (dbServiceRef.current) {
      dbServiceRef.current.saveTerms(updatedTerms);
      dbServiceRef.current.saveCourses(updatedCourses);
    }
  };

  const editTerm = (termNumber: number, startDate: string, endMonth: number, endWeek: number) => {
    const updatedTerms = terms.map(t =>
      t.termNumber === termNumber
        ? { ...t, startDate, endMonth, endWeek }
        : t
    );
    setTerms(updatedTerms);

    // Save to database
    if (dbServiceRef.current) {
      dbServiceRef.current.saveTerms(updatedTerms);
    }
  };

  const migrateLegacyCourses = () => {
    const selectedTermNum = parseInt(migrationTermNumber);

    // Assign selected term number to all courses without a termNumber
    const updatedCourses = courses.map(course =>
      course.termNumber === undefined ? { ...course, termNumber: selectedTermNum } : course
    );
    setCourses(updatedCourses);

    // Check if the term already exists
    const termExists = terms.some(t => t.termNumber === selectedTermNum);
    let updatedTerms = [...terms];

    if (!termExists) {
      // Create the term with default dates
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Default 3 months duration

      const newTerm: Term = {
        id: 'term-' + Date.now(),
        termNumber: selectedTermNum,
        startDate: now.toISOString().split('T')[0], // YYYY-MM-DD format
        endMonth: endDate.getMonth(),
        endWeek: 3, // 4th week (0-indexed)
        createdAt: Date.now(),
      };
      updatedTerms = [...terms, newTerm].sort((a, b) => b.termNumber - a.termNumber);
      setTerms(updatedTerms);
    }

    setSelectedTerm(selectedTermNum);

    // Save to database
    if (dbServiceRef.current) {
      dbServiceRef.current.saveCourses(updatedCourses);
      dbServiceRef.current.saveTerms(updatedTerms);
    }

    setShowMigrationPrompt(false);
  };

  const updateLeaves = (id: string, delta: number) => {
    const updatedCourses = courses.map(course =>
      course.id === id
        ? { ...course, leaves: Math.max(0, course.leaves + delta) }
        : course
    );
    setCourses(updatedCourses);

    // Save to database (network-first, with offline fallback)
    if (dbServiceRef.current) {
      dbServiceRef.current.saveCourses(updatedCourses);
    }
  };

  const deleteCourse = (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    setCourses(updatedCourses);

    // Save to database (network-first, with offline fallback)
    if (dbServiceRef.current) {
      dbServiceRef.current.saveCourses(updatedCourses);
    }
  };

  // Show loading state (always light themed)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage isDark={isDark} />;
  }

  // Get user's first name with proper capitalization (first letter uppercase, rest lowercase)
  const rawFirstName = user.displayName?.split(' ')[0] || 'there';
  const firstName = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase();

  // Calculate header opacity based on scroll (fades out between 0-100px)
  const scrollProgress = Math.min(scrollY / 100, 1); // 0 to 1
  // Apply ease-out cubic curve for smooth fade
  const easedProgress = 1 - Math.pow(1 - scrollProgress, 3);
  const headerOpacity = Math.max(0, 1 - easedProgress);
  const headerTranslateY = Math.min(scrollY / 3, 20); // Subtle upward movement

  // Show main app if authenticated
  return (
    <div className={`min-h-screen transition-colors ${isDark
      ? 'bg-gradient-to-br from-gray-900 to-gray-800'
      : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
      {/* Update notification banner */}
      <UpdatePrompt />

      {/* Mobile-optimized container */}
      <div className="max-w-2xl mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header
          className="sticky top-0 z-10 backdrop-blur-lg bg-white/10 px-4 py-4 transition-all duration-300"
          style={{
            opacity: headerOpacity,
            transform: `translateY(-${headerTranslateY}px)`,
            pointerEvents: headerOpacity < 0.1 ? 'none' : 'auto'
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className={`text-xl whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <b>Margin</b>
              </h1>
              <p className={`text-sm whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Maximise your Leaves
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* User Dropdown - Button in header, menu renders separately */}
              <UserDropdown isDark={isDark} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 space-y-4 pb-40">
          {/* PWA Install Prompt */}
          <PWAPrompt isDark={isDark} />

          {activeSection === 'home' ? (
            <>
              {/* Migration Prompt for Legacy Users */}
              {showMigrationPrompt && (
                <div className={`rounded-2xl shadow-md p-5 mb-4 border-2 border-yellow-500 ${isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                  <h3 className={`mb-2 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Welcome to Terms! 🎓
                  </h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    We've added term management! Your existing courses need to be organized.
                    Select which term to assign them to, or add new terms first.
                  </p>

                  <div className="mb-4">
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Assign existing courses to:
                    </label>
                    <select
                      value={migrationTermNumber}
                      onChange={(e) => setMigrationTermNumber(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                        }`}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <option key={num} value={num}>
                          Term {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={migrateLegacyCourses}
                      className="flex-1 bg-[#e50914] hover:bg-[#b8070f] text-white px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Assign to Term {migrationTermNumber}
                    </button>
                    <button
                      onClick={() => setShowMigrationPrompt(false)}
                      className={`flex-1 px-4 py-2.5 rounded-xl transition-colors ${isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                    >
                      I'll Add Terms First
                    </button>
                  </div>
                </div>
              )}

              {/* Greeting */}
              <div className="mb-2">
                <h2
                  className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}
                  style={{
                    fontWeight: 500,
                    textShadow: isDark
                      ? '0 0 1px rgba(255,255,255,0.5)'
                      : '0 0 1px rgba(0,0,0,0.3)'
                  }}
                >
                  Hi, {firstName}!
                </h2>
              </div>

              {/* Dashboard - Show courses from selected term */}
              <Dashboard
                courses={selectedTerm !== null
                  ? courses.filter(c => c.termNumber === selectedTerm)
                  : courses.filter(c => c.termNumber === undefined)
                }
                isDark={isDark}
              />



              {/* View Past Terms and Add Term Buttons */}
              <div className="flex items-center gap-3 justify-end">
                {/* View Past Terms Button - Left of Add Term */}
                {terms.length > 1 && (
                  <button
                    onClick={() => setShowPastTerms(!showPastTerms)}
                    className={`px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${isDark
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    {showPastTerms ? 'Hide' : 'View'} Past Terms
                  </button>
                )}

                {/* Add Term Button - Right side */}
                <AddTermButton
                  onAddTerm={addTerm}
                  isDark={isDark}
                  existingTerms={terms.map(t => t.termNumber)}
                />
              </div>


              {/* Latest Term Card - Always show */}
              {terms.length > 0 && selectedTerm !== null && (
                <>
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current Term
                  </h4>
                  <TermCard
                    term={terms.find(t => t.termNumber === selectedTerm)!}
                    courses={courses.filter(c => c.termNumber === selectedTerm)}
                    isDark={isDark}
                    onAddCourse={addCourse}
                    onUpdateLeaves={updateLeaves}
                    onDeleteCourse={deleteCourse}
                    onDeleteTerm={deleteTerm}
                    onEditTerm={editTerm}
                    calendarCourseNames={calendarCourseNames}
                  />
                </>
              )}

              {/* Past Terms - Show when toggled */}
              {showPastTerms && terms.length > 1 && (
                <div className="space-y-3 mt-4">
                  <h4 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Past Terms
                  </h4>
                  {terms
                    .filter(t => t.termNumber !== selectedTerm)
                    .map((term) => (
                      <TermCard
                        key={term.id}
                        term={term}
                        courses={courses.filter(c => c.termNumber === term.termNumber)}
                        isDark={isDark}
                        onAddCourse={addCourse}
                        onUpdateLeaves={updateLeaves}
                        onDeleteCourse={deleteCourse}
                        onDeleteTerm={deleteTerm}
                        onEditTerm={editTerm}
                        calendarCourseNames={calendarCourseNames}
                      />
                    ))}
                </div>
              )}
            </>
          ) : activeSection === 'calendar' ? (
            <CalendarPage isDark={isDark} />
          ) : (
            <SettingsPage isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
          )}
        </main>
      </div>

      {/* Navigation - Outside container to float freely */}
      <Navigation
        isDark={isDark}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
