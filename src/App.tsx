import { useState, useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { CourseList } from './components/CourseList';
import { AddCourseButton } from './components/AddCourseButton';
import { Dashboard } from './components/Dashboard';
import { PWAPrompt } from './components/PWAPrompt';
import { UpdatePrompt } from './components/UpdatePrompt';
import { LoginPage } from './components/LoginPage';
import { UserDropdown } from './components/UserDropdown';
import { Navigation } from './components/Navigation';
import { SettingsPage } from './components/SettingsPage';
import { CalendarPage } from './components/CalendarPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DatabaseService, createDatabaseService, Course as DBCourse } from './firebase/database';

export interface Course {
  id: string;
  name: string;
  shortName?: string;
  leaves: number;
  maxLeaves: number;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const dbServiceRef = useRef<DatabaseService | null>(null);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const [activeSection, setActiveSection] = useState<'home' | 'calendar' | 'settings'>('home');

  // Initialize database service when user logs in
  useEffect(() => {
    if (user && !dbServiceRef.current) {
      const dbService = createDatabaseService(user.uid);
      dbServiceRef.current = dbService;

      // ⚡ CACHE-FIRST: Load instantly from localStorage (no await!)
      // Database syncs in background and updates UI if server has newer data
      const cachedCourses = dbService.initialize(setCourses);
      setCourses(cachedCourses);
      setIsInitialized(true); // UI shows immediately!
    } else if (!user && dbServiceRef.current) {
      // Clean up when user logs out
      dbServiceRef.current.cleanup();
      dbServiceRef.current = null;
      setCourses([]);
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

  const addCourse = (name: string, shortName: string, maxLeaves: number) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name,
      shortName: shortName.trim() || undefined,
      leaves: 0,
      maxLeaves,
    };
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);

    // Save to database (network-first, with offline fallback)
    if (dbServiceRef.current) {
      dbServiceRef.current.saveCourses(updatedCourses);
    }
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

              {/* Dashboard */}
              <Dashboard courses={courses} isDark={isDark} />

              {/* Add Course Button */}
              <AddCourseButton onAddCourse={addCourse} isDark={isDark} />

              {/* Course List */}
              <CourseList
                courses={courses}
                onUpdateLeaves={updateLeaves}
                onDeleteCourse={deleteCourse}
                isDark={isDark}
              />
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