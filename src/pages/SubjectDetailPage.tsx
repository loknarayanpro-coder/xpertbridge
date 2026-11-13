import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { Subject, Resource } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { PdfViewerModal } from '../components/resources/PdfViewerModal';
import { UploadResourceModal } from '../components/resources/UploadResourceModal';
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Layers, 
  ArrowLeft, 
  Plus, 
  Download, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const SubjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'question_papers'>('all');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    async function loadSubjectData() {
      if (!id) return;
      setLoading(true);
      try {
        const sub = await dataService.getSubjectById(id);
        if (sub) {
          setSubject(sub);
          const allRes = await dataService.getResources({ subjectId: sub.id });
          setResources(allRes);
        }
      } catch (err) {
        console.error('Error loading subject details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjectData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-[#102C4B]">Subject not found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">The requested course code could not be located.</p>
        <Link to="/departments" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
          Return to Departments
        </Link>
      </div>
    );
  }

  const notesList = resources.filter(r => r.resource_type === 'notes');
  const qpList = resources.filter(r => r.resource_type === 'question_paper');

  const filteredResources = resources.filter(r => {
    if (activeTab === 'notes' && r.resource_type !== 'notes') return false;
    if (activeTab === 'question_papers' && r.resource_type !== 'question_paper') return false;
    if (selectedUnit !== 'all') {
      if (r.unit_number !== selectedUnit && !r.units_label?.includes(`Unit ${selectedUnit}`)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <Link
          to="/departments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Departments</span>
        </Link>

        {/* Subject Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono text-xs font-bold rounded-md border border-blue-100">
                  {subject.subject_code}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                  {subject.department_code} Department
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                  Semester {subject.semester}
                </span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-mono text-xs font-semibold rounded-md border border-purple-100">
                  {subject.regulation} Regulation
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102C4B] tracking-tight">
                {subject.name}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                {subject.description}
              </p>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Contribute to Subject</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Course Code</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{subject.subject_code}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Units</span>
              <span className="font-bold text-slate-800 text-sm">5 Units Syllabus</span>
            </div>
            <div>
              <span className="text-slate-400 block">Lecture Notes</span>
              <span className="font-bold text-slate-800 text-sm">{notesList.length} Uploaded</span>
            </div>
            <div>
              <span className="text-slate-400 block">Question Papers</span>
              <span className="font-bold text-slate-800 text-sm">{qpList.length} Archived</span>
            </div>
          </div>
        </div>

        {/* Syllabus Units Breakdown */}
        {subject.units && subject.units.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#102C4B] mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Unit-wise Syllabus Structure</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subject.units.map((unit) => (
                <button
                  key={unit.unit_number}
                  onClick={() => setSelectedUnit(selectedUnit === unit.unit_number ? 'all' : unit.unit_number)}
                  className={`text-left p-4 rounded-xl border transition duration-150 ${
                    selectedUnit === unit.unit_number
                      ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-600 font-mono">
                      UNIT {unit.unit_number}
                    </span>
                    {selectedUnit === unit.unit_number && (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        Active filter
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 leading-snug mb-1">
                    {unit.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {unit.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resource Tabs: All, Notes, Question Papers */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`text-sm font-semibold pb-2 -mb-3 transition border-b-2 ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                All Resources ({resources.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`text-sm font-semibold pb-2 -mb-3 transition border-b-2 ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Notes ({notesList.length})
              </button>
              <button
                onClick={() => setActiveTab('question_papers')}
                className={`text-sm font-semibold pb-2 -mb-3 transition border-b-2 ${
                  activeTab === 'question_papers'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Question Papers ({qpList.length})
              </button>
            </div>

            {selectedUnit !== 'all' && (
              <button
                onClick={() => setSelectedUnit('all')}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear Unit Filter
              </button>
            )}
          </div>

          {/* Resources List */}
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  variant="card"
                  onQuickView={(r) => setPreviewResource(r)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No resources found for this filter.</p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSelectedUnit('all');
                }}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
              >
                Show all subject resources
              </button>
            </div>
          )}
        </div>

      </div>

      {/* PDF Viewer */}
      <PdfViewerModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      {/* Upload Modal with preset subject */}
      <UploadResourceModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => window.location.reload()}
        defaultDepartmentId={subject.department_id}
        defaultSubjectId={subject.id}
      />

    </div>
  );
};
