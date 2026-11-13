import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { materialsService } from '../lib/materials';
import { isSupabaseConfigured } from '../lib/supabase';
import { Resource } from '../types';
import { useBookmarks } from '../context/BookmarkContext';
import { useAuth } from '../context/AuthContext';
import { AuthRequiredModal } from '../components/common/AuthRequiredModal';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Bookmark as BookmarkIcon, 
  Share2, 
  FileText, 
  Building2, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  LogIn
} from 'lucide-react';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, login } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [resource, setResource] = useState<Resource | null>(null);
  const [related, setRelated] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;
  const [copied, setCopied] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'open' | 'download' | 'bookmark'>('open');

  useEffect(() => {
    async function loadResource() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await dataService.getResourceById(id);
        if (res) {
          setResource(res);
          const all = await dataService.getResources({ departmentId: res.department_id });
          setRelated(all.filter(r => r.id !== res.id).slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching resource:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResource();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-[#102C4B]">Resource not found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">The requested document could not be located or has been archived.</p>
        <Link to="/notes" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
          Return to Notes Library
        </Link>
      </div>
    );
  }

  const bookmarked = isBookmarked(resource.id);

  const executeDownload = async () => {
    if (!resource) return;
    await materialsService.downloadResource(resource);
  };

  const handleDownload = () => {
    if (!isAuthenticated) {
      setAuthAction('download');
      setAuthModalOpen(true);
      return;
    }
    executeDownload();
  };

  const handlePrint = () => {
    if (!isAuthenticated) {
      setAuthAction('open');
      setAuthModalOpen(true);
      return;
    }
    window.print();
  };

  const handleBookmarkToggle = () => {
    if (!isAuthenticated) {
      setAuthAction('bookmark');
      setAuthModalOpen(true);
      return;
    }
    if (resource) toggleBookmark(resource);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/notes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Resources</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg shadow-sm transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handleBookmarkToggle}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition ${
                bookmarked 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-blue-600'
              }`}
            >
              <BookmarkIcon className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
              <span>{bookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>
          </div>
        </div>

        {/* Resource Header Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                  resource.resource_type === 'question_paper'
                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                    : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  {resource.resource_type === 'question_paper' ? 'Previous Year Question Paper' : 'Lecture Notes'}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded-md">
                  {resource.subject_code}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                  {resource.department_code} • Sem {resource.semester}
                </span>
                {resource.units_label && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium text-xs rounded-md border border-emerald-100">
                    {resource.units_label}
                  </span>
                )}
                {!isAuthenticated && (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-medium text-xs rounded-md border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Sign in to open full PDF
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102C4B] tracking-tight">
                {resource.title}
              </h1>

              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                {resource.description}
              </p>

              {/* Attribution and Meta */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Uploaded by <strong className="text-slate-700">{resource.uploader_name}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-600">
                  {resource.file_size_formatted}
                </span>
                <span>•</span>
                <span className="text-blue-600 font-medium">
                  {resource.download_count} total downloads
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              {resource.storage_path && resource.storage_path.trim() !== '' && !resource.storage_path.startsWith('demo/') ? (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition cursor-pointer"
                >
                  {!isAuthenticated ? <Lock className="w-4 h-4 text-amber-300" /> : <Download className="w-4 h-4" />}
                  <span>{isAuthenticated ? 'Download Document' : 'Sign In to Download'}</span>
                </button>
              ) : (
                <div
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 font-semibold rounded-xl text-sm border border-slate-200 cursor-not-allowed select-none"
                  title="No PDF document has been uploaded for this resource yet"
                >
                  <div className="relative inline-flex items-center justify-center">
                    <Download className="w-4 h-4 text-slate-400" />
                    <span className="absolute w-5 h-[2px] bg-rose-500 rotate-45 transform" />
                  </div>
                  <span>No PDF Uploaded</span>
                </div>
              )}

              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>

        {/* In-Browser PDF Interactive Viewer Box (or Locked Canvas if guest) */}
        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="bg-[#102C4B] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-300" />
                <span className="text-xs font-semibold truncate text-white">{resource.original_filename}</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Protected Content
              </span>
            </div>

            <div className="relative min-h-[460px] flex items-center justify-center p-6 sm:p-12 bg-slate-50 overflow-hidden">
              {/* Central Glass Locked Notice Card */}
              <div className="relative z-20 max-w-lg w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 text-center animate-in fade-in">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#102C4B] tracking-tight">
                  Sign In Required to Open Full Document
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
                  Students can browse all department catalog metadata freely. To open complete lecture slides, interactive syllabus notes, and download offline PDFs, sign in with your student account.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      await login('student@xpertbridge.edu');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Instant Student Access (Demo)</span>
                  </button>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(`/resources/${resource.id}`)}&msg=auth_required`}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-slate-500" />
                    <span>Sign In to Account</span>
                  </Link>
                </div>
              </div>

              {/* Ghost preview lines underneath for realism */}
              <div className="absolute inset-0 p-10 flex flex-col items-center justify-center opacity-10 filter blur-xs select-none pointer-events-none">
                <div className="w-3/4 h-8 bg-slate-900 rounded mb-4" />
                <div className="w-full h-4 bg-slate-700 rounded mb-2" />
                <div className="w-5/6 h-4 bg-slate-700 rounded mb-2" />
                <div className="w-4/5 h-4 bg-slate-700 rounded mb-8" />
                <div className="w-full h-40 bg-slate-400 rounded" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {resource.storage_path && resource.storage_path.trim() !== '' && !resource.storage_path.startsWith('demo/') ? (
              <div className="w-full bg-slate-900 flex flex-col">
                <div className="bg-[#102C4B] text-white px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-300" />
                    <span className="text-xs font-semibold truncate text-white">{resource.original_filename}</span>
                  </div>
                  <a
                    href={materialsService.getPublicUrl(resource.storage_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <span>Open in New Tab</span>
                    <Share2 className="w-3.5 h-3.5" />
                  </a>
                </div>
                <iframe
                  src={`${materialsService.getPublicUrl(resource.storage_path)}#view=FitH`}
                  title={resource.title}
                  className="w-full min-h-[850px] border-0 bg-white"
                />
              </div>
            ) : (
              <>
                {/* Reader Toolbar */}
          <div className="bg-[#102C4B] text-white px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-semibold truncate text-white">{resource.original_filename}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 hover:text-white disabled:opacity-30 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 hover:text-white disabled:opacity-30 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-700 mx-2" />

              <button
                onClick={() => setZoomLevel(z => Math.max(70, z - 15))}
                className="p-1 hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-9 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(z => Math.min(150, z + 15))}
                className="p-1 hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Reader Document Canvas */}
          <div className="bg-slate-200 p-6 sm:p-10 flex justify-center items-start min-h-[600px] overflow-y-auto">
            <div 
              style={{ width: `${zoomLevel}%`, maxWidth: '850px' }}
              className="bg-white rounded shadow-lg p-8 sm:p-14 text-slate-800 font-sans border border-slate-300 transition-all duration-150 min-h-[750px] relative"
            >
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
                    XpertBridge Academic Resource Platform
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#102C4B] mt-1">
                    {resource.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Subject Code: {resource.subject_code} • Department: {resource.department_code}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 rounded text-xs font-mono font-semibold text-slate-700">
                  {resource.units_label || 'ACADEMIC PDF'}
                </span>
              </div>

              {/* Document Content */}
              <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-serif">
                <div className="p-4 bg-slate-50 rounded border border-slate-200 font-sans text-xs">
                  <p className="font-semibold text-slate-800 mb-1">Academic Synopsis</p>
                  <p className="text-slate-600">{resource.description}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-base text-[#102C4B] border-l-4 border-blue-600 pl-3">
                    Curriculum Topics & Principles
                  </h4>

                  {resource.sample_content && resource.sample_content.length > 0 ? (
                    <ul className="list-disc pl-6 space-y-2 text-slate-700 font-sans text-xs sm:text-sm">
                      {resource.sample_content.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 font-sans">
                      Verified academic material matching university regulation standards.
                    </p>
                  )}

                  <h4 className="font-sans font-bold text-base text-[#102C4B] border-l-4 border-purple-600 pl-3 pt-3">
                    Mathematical Foundations & Formulae
                  </h4>
                  <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                    <p>1. Primary Asymptotic Formula: O(1) &lt; O(log n) &lt; O(n) &lt; O(n log n) &lt; O(n^2)</p>
                    <p>2. Amortized Complexity Analysis via Potential Method: Phi(D_i) - Phi(D_0)</p>
                    <p>3. Binary Search Tree Invariant: Left(u) &lt; u &lt; Right(u)</p>
                  </div>
                </div>
              </div>

              {/* Watermark Footer */}
              <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-mono">
                XPERTBRIDGE • {resource.original_filename}
              </div>
            </div>
          </div>
          </>
          )}
        </div>
        )}

        {/* Related Resources from Same Department */}
        {related.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-bold text-[#102C4B]">
              Related {resource.department_code} Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <div key={rel.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition">
                  <Link to={`/resources/${rel.id}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600 line-clamp-1 block">
                    {rel.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">
                    {rel.subject_code} • Sem {rel.semester} • {rel.units_label || 'Notes'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <AuthRequiredModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          resource={resource}
          actionType={authAction}
          onSuccess={() => {
            if (authAction === 'download') {
              executeDownload();
            }
          }}
        />

      </div>
    </div>
  );
};
