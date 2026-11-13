import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Resource, Department } from '../../types';
import { ResourceCard } from '../resources/ResourceCard';
import { FileText, ArrowRight } from 'lucide-react';

interface PopularNotesSectionProps {
  popularNotes: Resource[];
  departments: Department[];
  onQuickView?: (resource: Resource) => void;
}

export const PopularNotesSection: React.FC<PopularNotesSectionProps> = ({
  popularNotes,
  departments,
  onQuickView,
}) => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSem, setSelectedSem] = useState('');

  const handleDepartmentChange = (dept: string) => {
    setSelectedDept(dept);
    const params = new URLSearchParams();
    if (dept) params.set('dept', dept);
    if (selectedYear) params.set('year', selectedYear);
    if (selectedSem) params.set('sem', selectedSem);
    navigate(`/question-papers?${params.toString()}`);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const params = new URLSearchParams();
    if (selectedDept) params.set('dept', selectedDept);
    if (year) params.set('year', year);
    if (selectedSem) params.set('sem', selectedSem);
    navigate(`/question-papers?${params.toString()}`);
  };

  const handleSemChange = (sem: string) => {
    setSelectedSem(sem);
    const params = new URLSearchParams();
    if (selectedDept) params.set('dept', selectedDept);
    if (selectedYear) params.set('year', selectedYear);
    if (sem) params.set('sem', sem);
    navigate(`/question-papers?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedDept('');
    setSelectedYear('');
    setSelectedSem('');
    navigate('/question-papers');
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column (approx 65% width): Popular Notes matching reference */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-2xl font-extrabold text-[#102C4B] tracking-tight">
                  Popular Notes
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Most viewed and downloaded notes from your college.
                </p>
              </div>

              <Link
                to="/notes?sort=popular"
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List of row cards with clean subtle dividers matching reference */}
            <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
              {popularNotes.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  variant="row"
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          </div>

          {/* Right Column (approx 35% width): Previous Year Question Papers & Quick Filters */}
          <div className="lg:col-span-5">
            <div className="bg-[#F8FAFC] rounded-2xl p-6 sm:p-7 border border-slate-100 space-y-6">
              
              {/* Header with Purple Document Icon matching reference */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#102C4B] leading-snug">
                    Previous Year Question Papers
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Access past year papers, subject-wise and semester-wise.
                  </p>
                </div>
              </div>

              {/* Blue Action Button */}
              <div>
                <Link
                  to="/question-papers"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  <span>Browse Question Papers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick Filters Form matching reference */}
              <div className="pt-4 border-t border-slate-200/60 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-700">
                  Quick Filters
                </h4>

                {/* Department Dropdown */}
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.code}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic Year Dropdown */}
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* Semester Dropdown */}
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Semester
                  </label>
                  <select
                    value={selectedSem}
                    onChange={(e) => handleSemChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s.toString()}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                {/* Clear filters link on bottom-right matching reference */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Clear filters
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
