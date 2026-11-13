import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { Department, Subject, Resource, ResourceFilters as FilterStateType } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceFilters } from '../components/resources/ResourceFilters';
import { PdfViewerModal } from '../components/resources/PdfViewerModal';
import { UploadResourceModal } from '../components/resources/UploadResourceModal';
import { AuthRequiredModal } from '../components/common/AuthRequiredModal';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Plus, FileQuestion, ArrowRight, Clock } from 'lucide-react';

export const NotesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filter state initialized from URL
  const [filters, setFilters] = useState<FilterStateType>({
    searchQuery: searchParams.get('q') || '',
    departmentId: searchParams.get('dept') || 'all',
    semester: searchParams.get('sem') || 'all',
    academicYear: searchParams.get('year') || 'all',
    subjectId: searchParams.get('subject') || 'all',
    unit: searchParams.get('unit') || 'all',
    resourceType: (searchParams.get('type') as any) || 'all',
    regulation: 'all',
    examYear: 'all',
    sortBy: (searchParams.get('sort') as any) || 'newest',
  });

  // Sync state changes with URL query parameters
  const updateFilters = (updated: Partial<FilterStateType>) => {
    setFilters(prev => {
      const next = { ...prev, ...updated };
      const params = new URLSearchParams();
      if (next.searchQuery) params.set('q', next.searchQuery);
      if (next.departmentId && next.departmentId !== 'all') params.set('dept', next.departmentId);
      if (next.semester && next.semester !== 'all') params.set('sem', next.semester);
      if (next.unit && next.unit !== 'all') params.set('unit', next.unit);
      if (next.sortBy && next.sortBy !== 'newest') params.set('sort', next.sortBy);
      setSearchParams(params, { replace: true });
      return next;
    });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      departmentId: 'all',
      semester: 'all',
      academicYear: 'all',
      subjectId: 'all',
      unit: 'all',
      resourceType: 'all',
      regulation: 'all',
      examYear: 'all',
      sortBy: 'newest',
    });
    setSearchParams({});
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [depts, allNotes] = await Promise.all([
        dataService.getDepartments(),
        dataService.getResources({ ...filters }),
      ]);
      setDepartments(depts);
      setResources(allNotes);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Academic Curriculum Library</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102C4B] tracking-tight">
              Class Notes & Study Materials
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Unit-wise digitized lecture notes, formula sheets, and handwritten modules for all semesters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Notes</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="space-y-4">
          <div className="relative max-w-2xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by topic, unit, subject name, or code (e.g. CS3351)..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm transition"
            />
          </div>

          <ResourceFilters
            filters={filters}
            departments={departments}
            onChange={updateFilters}
            onReset={resetFilters}
            showQuestionPaperFilters={false}
          />
        </div>

        {/* Resources Grid / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-white rounded-xl border border-slate-200 animate-pulse p-5" />
            ))}
          </div>
        ) : resources.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
              <span>Showing {resources.length} verified notes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  variant="card"
                  onQuickView={(res) => setPreviewResource(res)}
                />
              ))}
            </div>
          </div>
        ) : (
          (() => {
            const isNonCse = filters.departmentId && filters.departmentId !== 'all' && filters.departmentId !== 'dept-cse' && filters.departmentId !== 'CSE';
            const matchedDept = departments.find(d => d.id === filters.departmentId || d.code === filters.departmentId);
            const deptName = matchedDept ? matchedDept.name : 'This department';

            if (isNonCse) {
              return (
                <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-2xl mx-auto space-y-4">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      Available Soon
                    </span>
                    <h3 className="text-xl font-bold text-[#102C4B] mt-2">
                      {deptName} resources are in progress
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                      We are currently focused on Computer Science & Engineering. Notes, syllabi, and study guides for {deptName} are being actively curated by our student toppers and will be available soon.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => updateFilters({ departmentId: 'CSE' })}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                    >
                      Browse Computer Science (CSE) Notes
                    </button>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileQuestion className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#102C4B]">No notes found for these filters</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  Try adjusting your semester or unit filters, or search with different keywords.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            );
          })()
        )}

      </div>

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      {/* Upload Modal */}
      <UploadResourceModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadData}
        defaultResourceType="notes"
      />

    </div>
  );
};
