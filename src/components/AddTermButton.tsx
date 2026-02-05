import { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';

interface AddTermButtonProps {
    onAddTerm: (termNumber: number, startDate: string, endMonth: number, endWeek: number) => void;
    isDark: boolean;
    existingTerms: number[];
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKS = ['1st Week', '2nd Week', '3rd Week', '4th Week'];

export function AddTermButton({ onAddTerm, isDark, existingTerms }: AddTermButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [termNumber, setTermNumber] = useState('1');
    const [startDate, setStartDate] = useState('');
    const [endMonth, setEndMonth] = useState('0');
    const [endWeek, setEndWeek] = useState('3');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const term = parseInt(termNumber);

        if (existingTerms.includes(term)) {
            alert(`Term ${term} already exists!`);
            return;
        }

        if (!startDate) {
            alert('Please select a start date');
            return;
        }

        onAddTerm(
            term,
            startDate,
            parseInt(endMonth),
            parseInt(endWeek)
        );

        // Reset and close
        setTermNumber('1');
        setStartDate('');
        setEndMonth('0');
        setEndWeek('3');
        setIsOpen(false);
    };

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
                    <Calendar size={18} />
                    <span>Add Term</span>
                </button>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={isDark ? 'text-white' : 'text-gray-800'}>New Term</h3>
                <button
                    onClick={() => {
                        setIsOpen(false);
                        setTermNumber('1');
                        setStartDate('');
                        setEndMonth('0');
                        setEndWeek('3');
                    }}
                    className={`p-1 rounded-lg transition-colors ${isDark
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-100 text-gray-500'
                        }`}
                >
                    <X size={20} />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={`block text-sm mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Term Number *
                    </label>
                    <select
                        value={termNumber}
                        onChange={(e) => setTermNumber(e.target.value)}
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-200 text-gray-900'
                            }`}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <option
                                key={num}
                                value={num}
                                disabled={existingTerms.includes(num)}
                            >
                                Term {num} {existingTerms.includes(num) ? '(Already exists)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={`block text-sm mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Start Date *
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-200 text-gray-900'
                            }`}
                    />
                </div>

                <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        End Date *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Month
                            </label>
                            <select
                                value={endMonth}
                                onChange={(e) => setEndMonth(e.target.value)}
                                required
                                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
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
                                Week (1-4)
                            </label>
                            <select
                                value={endWeek}
                                onChange={(e) => setEndWeek(e.target.value)}
                                required
                                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#e50914] ${isDark
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
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(false);
                            setTermNumber('1');
                            setStartDate('');
                            setEndMonth('0');
                            setEndWeek('3');
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-xl transition-colors ${isDark
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-[#e50914] hover:bg-[#b8070f] text-white px-4 py-2.5 rounded-xl transition-colors"
                    >
                        Add Term
                    </button>
                </div>
            </form>
        </div>
    );
}
