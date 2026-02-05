import { Plus, Minus, Trash2, Edit2, Check, X } from 'lucide-react';
import { AddCourseButton } from './AddCourseButton';
import { useState } from 'react';

export interface Term {
    id: string;
    termNumber: number;
    startDate: string;
    endMonth: number;
    endWeek: number;
    createdAt: number;
}

export interface Course {
    id: string;
    name: string;
    shortName?: string;
    leaves: number;
    maxLeaves: number;
    termNumber?: number;
}

interface TermCardProps {
    term: Term;
    courses: Course[];
    isDark: boolean;
    onAddCourse: (name: string, shortName: string, maxLeaves: number) => void;
    onUpdateLeaves: (id: string, delta: number) => void;
    onDeleteCourse: (id: string) => void;
    onDeleteTerm?: (termNumber: number) => void;
    onEditTerm?: (termNumber: number, startDate: string, endMonth: number, endWeek: number) => void;
    calendarCourseNames?: string[];
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKS = ['1st Week', '2nd Week', '3rd Week', '4th Week'];

export function TermCard({ term, courses, isDark, onAddCourse, onUpdateLeaves, onDeleteCourse, onDeleteTerm, onEditTerm, calendarCourseNames }: TermCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editStartDate, setEditStartDate] = useState(term.startDate);
    const [editEndMonth, setEditEndMonth] = useState(term.endMonth.toString());
    const [editEndWeek, setEditEndWeek] = useState(term.endWeek.toString());

    const startDateObj = new Date(term.startDate);
    const formattedStartDate = startDateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const endMonthName = MONTHS[term.endMonth];
    const endWeekName = WEEKS[term.endWeek];

    const handleSaveEdit = () => {
        if (onEditTerm) {
            onEditTerm(term.termNumber, editStartDate, parseInt(editEndMonth), parseInt(editEndWeek));
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditStartDate(term.startDate);
        setEditEndMonth(term.endMonth.toString());
        setEditEndWeek(term.endWeek.toString());
        setIsEditing(false);
    };

    return (
        <div className={`rounded-2xl shadow-md p-5 ${isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
            {/* Header with Term Number, Edit, and Delete Buttons */}
            <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Term {term.termNumber}
                </h3>
                <div className="flex items-center gap-2">
                    {!isEditing && onEditTerm && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                                }`}
                            title="Edit Term Dates"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    {onDeleteTerm && (
                        <button
                            onClick={() => onDeleteTerm(term.termNumber)}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'
                                }`}
                            title="Delete Term"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Date Information or Edit Form */}
            {isEditing ? (
                <div className="mb-4 space-y-3">
                    <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-200 text-gray-900'
                                }`}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                End Month
                            </label>
                            <select
                                value={editEndMonth}
                                onChange={(e) => setEditEndMonth(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                    }`}
                            >
                                {MONTHS.map((month, index) => (
                                    <option key={index} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                End Week
                            </label>
                            <select
                                value={editEndWeek}
                                onChange={(e) => setEditEndWeek(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                    }`}
                            >
                                {WEEKS.map((week, index) => (
                                    <option key={index} value={index}>
                                        {week}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveEdit}
                            className="flex-1 bg-[#e50914] hover:bg-[#b8070f] text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                        >
                            <Check size={16} />
                            Save
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm ${isDark
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                }`}
                        >
                            <X size={16} />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p><span className="font-medium">Start:</span> {formattedStartDate}</p>
                    <p><span className="font-medium">End:</span> {endMonthName}, {endWeekName}</p>
                </div>
            )}

            {/* Add Course Button */}
            <div className="mb-4">
                <AddCourseButton
                    onAddCourse={onAddCourse}
                    isDark={isDark}
                    existingCourseNames={calendarCourseNames || []}
                />
            </div>

            {/* Courses List inside the term card */}
            {courses.length > 0 && (
                <div className="space-y-2">
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Courses ({courses.length})
                    </h4>
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className={`rounded-xl p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h5 className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {course.name}
                                        {course.shortName && (
                                            <span className={`ml-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                ({course.shortName})
                                            </span>
                                        )}
                                    </h5>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        {course.leaves} / {course.maxLeaves} leaves
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => onUpdateLeaves(course.id, -1)}
                                        disabled={course.leaves <= 0}
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '14px',
                                            backgroundColor: course.leaves <= 0 ? '#D1D5DB' : '#FCA5A5',
                                        }}
                                        className={`flex items-center justify-center transition-all ${course.leaves <= 0
                                            ? 'opacity-40 cursor-not-allowed bg-gray-300'
                                            : 'active:scale-95 text-white'
                                            }`}
                                    >
                                        <Minus size={20} strokeWidth={2} />
                                    </button>

                                    <button
                                        onClick={() => onUpdateLeaves(course.id, 1)}
                                        disabled={course.leaves >= course.maxLeaves}
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '14px',
                                            backgroundColor: course.leaves >= course.maxLeaves ? '#D1D5DB' : '#a5ecc0ff',
                                        }}
                                        className={`flex items-center justify-center transition-all ${course.leaves >= course.maxLeaves
                                            ? 'opacity-40 cursor-not-allowed bg-gray-300'
                                            : 'active:scale-95 text-white'
                                            }`}
                                    >
                                        <Plus size={20} strokeWidth={2} />
                                    </button>

                                    <button
                                        onClick={() => onDeleteCourse(course.id)}
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '14px',
                                        }}
                                        className={`flex items-center justify-center transition-all ${isDark
                                            ? 'bg-gray-600 hover:bg-red-600 text-gray-300 hover:text-white active:scale-95'
                                            : 'bg-gray-200 hover:bg-red-500 text-gray-600 hover:text-white active:scale-95'
                                            }`}
                                    >
                                        <Trash2 size={20} strokeWidth={2} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    ))}
                </div>
            )}
        </div>
    );
}
