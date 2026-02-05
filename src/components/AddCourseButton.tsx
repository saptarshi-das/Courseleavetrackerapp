import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AddCourseButtonProps {
  onAddCourse: (name: string, shortName: string, maxLeaves: number) => void;
  isDark: boolean;
  existingCourseNames?: string[]; // For autocomplete suggestions
}

export function AddCourseButton({ onAddCourse, isDark, existingCourseNames = [] }: AddCourseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [shortName, setShortName] = useState('');
  const [maxLeaves, setMaxLeaves] = useState('10');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseName.trim() && maxLeaves) {
      onAddCourse(courseName.trim(), shortName.trim(), parseInt(maxLeaves));
      setCourseName('');
      setShortName('');
      setMaxLeaves('10');
      setIsOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCourseName(suggestion);
    setShowSuggestions(false);
  };

  // Show all suggestions when empty, filter when typing
  const filteredSuggestions = courseName.trim() === ''
    ? existingCourseNames
    : existingCourseNames.filter(name =>
      name.toLowerCase().includes(courseName.toLowerCase()) && name !== courseName
    );

  // Debug logging
  console.log('AddCourseButton Debug:', {
    showSuggestions,
    courseName,
    existingCourseNames,
    filteredSuggestions
  });

  if (!isOpen) {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(true)}
          className={`rounded-xl shadow-md px-5 py-2.5 flex items-center gap-2 transition-all ${isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-white'
            : 'bg-white hover:bg-gray-50 text-gray-800'
            }`}
        >
          <Plus size={18} />
          <span>Add Course</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={isDark ? 'text-white' : 'text-gray-800'}>New Course</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setCourseName('');
            setShortName('');
            setMaxLeaves('10');
            setShowSuggestions(false);
          }}
          className={`p-1 rounded-lg transition-colors ${isDark
            ? 'hover:bg-gray-700 text-gray-400'
            : 'hover:bg-gray-100 text-gray-500'
            }`}
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <label className={`block text-sm mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Course Name *
          </label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => {
              setCourseName(e.target.value);
              setShowSuggestions(true); // Always show when typing
            }}
            onFocus={() => setShowSuggestions(true)} // Always show on focus
            onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
            placeholder="e.g., Indian Economy and Marketing"
            autoFocus
            required
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
          />

          {/* Autocomplete Suggestions - Outside and below input */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className={`absolute left-0 right-0 mt-2 rounded-xl border shadow-lg max-h-48 overflow-y-auto z-50 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}>
              <div className={`px-3 py-2 text-xs font-medium border-b ${isDark ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'
                }`}>
                Suggestions from existing courses
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b last:border-b-0 ${isDark
                    ? 'hover:bg-gray-600 text-gray-200 border-gray-600'
                    : 'hover:bg-gray-50 text-gray-800 border-gray-100'
                    }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={`block text-sm mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Short Name (Optional)
          </label>
          <input
            type="text"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="e.g., IEM"
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Maximum Leaves *
          </label>
          <input
            type="number"
            value={maxLeaves}
            onChange={(e) => setMaxLeaves(e.target.value)}
            min="1"
            required
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
              }`}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#e50914] hover:bg-[#b8070f] text-white px-4 py-2.5 rounded-xl transition-colors font-medium"
        >
          Add Course
        </button>
      </form>
    </div>
  );
}