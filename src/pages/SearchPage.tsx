import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { Resource, Subject, Department } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { PdfViewerModal } from '../components/resources/PdfViewerModal';
import { 
  Search, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  ArrowRight,
  Filter,
  X
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'qp' | 'subjects'>('all');
  
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    async function loadSearchData() {
      setLoading(true);
      try {
        const [res, subs, depts] = await Promise.all([
          dataService.getResources({ searchQuery: query }),
          dataService.getSubjects(),
          dataService.getDepartments(),
        ]);
        setAllResources(res);
        setAllSubjects(subs.filter(s => 
          !query || 
          s.name.toLowerCase().includes(query.toLowerCase()) || 
          s.subject_code.toLowerCase().includes(query.toLowerCase()) ||
          s.department_code.toLowerCase().includes(query.toLowerCase())
        ));
        setAllDepartments(depts);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSearchData();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    } else {
      setSearchParams({});
    }
  };

  const notesResults = allResources.filter(r => r.resource_type === 'notes');
  const qpResults = allResources.filter(r => r.resource_type === 'question_paper');

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search Header & Bar */}
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102C4B] tracking-tight mb-2">
            Academic Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Find lecture notes, unit syllabus topics, past exam papers, and subject codes instantly.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative shadow-sm">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, subject name, course code (e.g. CS3351), or department..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full pl-12 pr-24 py-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  setSearchParams({});
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Search Facet Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Results ({allResources.length + allSubjects.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lecture Notes ({notesResults.length})
          </button>
          <button
            onClick={() => setActiveTab('qp')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'qp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Question Papers ({qpResults.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'subjects'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Subjects ({allSubjects.length})
          </button>
        </div>

        {/* Results Area */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Searching library...</div>
        ) : (
          <div className="space-y-8">
            
            {/* Matching Subjects Section */}
            {(activeTab === 'all' || activeTab === 'subjects') && allSubjects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Matching Subjects ({allSubjects.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allSubjects.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/subjects/${sub.id}`}
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition block"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {sub.subject_code}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {sub.department_code} • Sem {sub.semester}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#102C4B]">{sub.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sub.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Notes / Question Papers */}
            {(activeTab === 'all' || activeTab === 'notes' || activeTab === 'qp') && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>
                    Matching Resources (
                    {activeTab === 'notes' ? notesResults.length : activeTab === 'qp' ? qpResults.length : allResources.length}
                    )
                  </span>
                </h3>

                {(activeTab === 'notes' ? notesResults : activeTab === 'qp' ? qpResults : allResources).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(activeTab === 'notes' ? notesResults : activeTab === 'qp' ? qpResults : allResources).map((res) => (
                      <ResourceCard
                        key={res.id}
                        resource={res}
                        variant="card"
                        onQuickView={(r) => setPreviewResource(r)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 bg-white rounded-xl border border-slate-200 text-center p-6">
                    <p className="text-sm text-slate-600">No resources found matching &ldquo;{query}&rdquo;.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      <PdfViewerModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />
    </div>
  );
};
