import React from 'react';
import { Department, ResourceFilters as FilterStateType } from '../../types';
import { Filter, X, ArrowUpDown } from 'lucide-react';

interface ResourceFiltersProps {
  filters: FilterStateType;
  departments: Department[];
  onChange: (updated: Partial<FilterStateType>) => void;
  onReset: () => void;
  showQuestionPaperFilters?: boolean;
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  filters,
  departments,
  onChange,
  onReset,
  showQuestionPaperFilters = false,
}) => {
  const hasActiveFilters = Boolean(
    (filters.departmentId && filters.departmentId !== 'all') ||
    (filters.semester && filters.semester !== 'all') ||
    (filters.unit && filters.unit !== 'all') ||
    (filters.regulation && filters.regulation !== 'all') ||
    (filters.examYear && filters.examYear !== 'all') ||
    (filters.resourceType && filters.resourceType !== 'all') ||
    (filters.searchQuery && filters.searchQuery.trim() !== '')
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#102C4B]">
            Filters & Sorting
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Select Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Department */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Department
          </label>
          <select
            value={filters.departmentId || 'all'}
            onChange={(e) => onChange({ departmentId: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.code}>
                {dept.code} — {dept.name} {dept.code === 'CSE' ? '(Available Now)' : '(Available Soon)'}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Semester
          </label>
          <select
            value={filters.semester || 'all'}
            onChange={(e) => onChange({ semester: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s.toString()}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Filter (mainly for notes) */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Unit
          </label>
          <select
            value={filters.unit || 'all'}
            onChange={(e) => onChange({ unit: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Units</option>
            {[1, 2, 3, 4, 5].map((u) => (
              <option key={u} value={u.toString()}>
                Unit {u}
              </option>
            ))}
          </select>
        </div>

        {/* Question paper specific: Regulation */}
        {showQuestionPaperFilters ? (
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Regulation
            </label>
            <select
              value={filters.regulation || 'all'}
              onChange={(e) => onChange({ regulation: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Regulations</option>
              <option value="R2021">R2021 (Current)</option>
              <option value="R2017">R2017</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Resource Type
            </label>
            <select
              value={filters.resourceType || 'all'}
              onChange={(e) => onChange({ resourceType: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="notes">Lecture Notes</option>
              <option value="important_questions">Important Questions</option>
              <option value="question_paper">Question Papers</option>
              <option value="reference_material">Study Materials</option>
            </select>
          </div>
        )}

        {/* Exam Year (for question papers) */}
        {showQuestionPaperFilters && (
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Exam Year
            </label>
            <select
              value={filters.examYear || 'all'}
              onChange={(e) => onChange({ examYear: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Exam Years</option>
              <option value="2026">2026 (Latest)</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>
        )}

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            Sort By
          </label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => onChange({ sortBy: e.target.value as any })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Downloaded</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
