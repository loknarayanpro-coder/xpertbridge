import React, { useState, useEffect } from 'react';
import { Resource } from '../../types';
import { useBookmarks } from '../../context/BookmarkContext';
import { dataService } from '../../lib/dataService';
import { materialsService } from '../../lib/materials';
import { 
  X, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Bookmark as BookmarkIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface PdfViewerModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ resource, onClose }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 5;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!resource) return null;

  const bookmarked = isBookmarked(resource.id);
  const pdfUrl = resource ? materialsService.getPublicUrl(resource.storage_path) : '';
  const hasRealPdf = Boolean(pdfUrl && !resource.storage_path?.startsWith('demo/'));

  const handleDownload = async () => {
    if (resource) {
      await materialsService.downloadResource(resource);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-slate-700"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Viewer Toolbar */}
        <div className="bg-[#102C4B] text-white px-4 py-3 flex items-center justify-between gap-3 shrink-0 select-none">
          
          {/* Document Title & Subject Code */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-blue-600/30 text-cyan-300 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate leading-tight">
                {resource.title}
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                {resource.subject_code} • {resource.department_code} • Sem {resource.semester} • {resource.file_size_formatted}
              </p>
            </div>
          </div>

          {/* Viewer Controls: Zoom & Pagination */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-200">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:text-white disabled:opacity-30 rounded"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 hover:text-white disabled:opacity-30 rounded"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-700 mx-1" />

            <button
              onClick={() => setZoomLevel(z => Math.max(70, z - 15))}
              className="p-1 hover:text-white rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] w-10 text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(150, z + 15))}
              className="p-1 hover:text-white rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons: Bookmark, Print, Download, Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleBookmark(resource)}
              title={bookmarked ? 'Saved to bookmarks' : 'Save bookmark'}
              className={`p-2 rounded-lg transition ${
                bookmarked ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookmarkIcon className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={handlePrint}
              title="Print Document"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition hidden sm:inline-flex"
            >
              <Printer className="w-4 h-4" />
            </button>

            {resource.storage_path && resource.storage_path.trim() !== '' && !resource.storage_path.startsWith('demo/') ? (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            ) : (
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-400 text-xs font-medium rounded-lg border border-slate-700 cursor-not-allowed select-none"
                title="No PDF uploaded yet"
              >
                <div className="relative inline-flex items-center justify-center">
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span className="absolute w-4 h-[1.5px] bg-rose-500 rotate-45 transform" />
                </div>
                <span>No PDF</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Canvas */}
        {hasRealPdf ? (
          <div className="flex-1 bg-slate-900 w-full flex flex-col min-h-[650px]">
            <iframe
              src={`${pdfUrl}#view=FitH`}
              title={resource.title}
              className="w-full flex-1 min-h-[650px] border-0 bg-white"
            />
          </div>
        ) : (
          <div className="flex-1 bg-slate-200 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
            <div 
              style={{ width: `${zoomLevel}%`, maxWidth: '850px' }}
              className="bg-white rounded-sm shadow-xl p-8 sm:p-12 text-slate-800 font-sans border border-slate-300 transition-all duration-150 min-h-[750px] relative"
            >
            {/* Header Stamp */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
              <div>
                <p className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
                  XpertBridge Verified Academic Resource
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-[#102C4B] mt-1">
                  {resource.title}
                </h1>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {resource.subject_name || resource.subject_code} • Course Code: {resource.subject_code}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-slate-100 rounded text-[11px] font-mono font-semibold text-slate-700">
                  {resource.resource_type === 'question_paper' ? 'UNIVERSITY EXAM' : (resource.units_label || 'UNIT NOTES')}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Page {currentPage} of {totalPages}</p>
              </div>
            </div>

            {/* Document Body with Realistic Academic Formatting */}
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-serif">
              <div className="p-4 bg-slate-50 rounded border border-slate-200 font-sans text-xs">
                <p className="font-semibold text-slate-800 mb-1">Module Overview & Learning Outcomes</p>
                <p className="text-slate-600">{resource.description}</p>
                <div className="mt-2.5 flex flex-wrap gap-4 text-[11px] text-slate-500 font-mono">
                  <span>Semester: {resource.semester}</span>
                  <span>Regulation: {resource.question_paper?.regulation || 'R2021'}</span>
                  <span>Uploader: {resource.uploader_name}</span>
                </div>
              </div>

              {/* Sample academic sections */}
              <div className="space-y-4">
                <h4 className="font-sans font-bold text-base text-[#102C4B] border-l-4 border-blue-600 pl-3">
                  1. Comprehensive Syllabus Synopsis
                </h4>
                
                {resource.sample_content && resource.sample_content.length > 0 ? (
                  <ul className="list-disc pl-6 space-y-2 text-slate-700 font-sans text-xs sm:text-sm">
                    {resource.sample_content.map((point, idx) => (
                      <li key={idx} className="leading-normal">
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic font-sans">
                    Detailed theoretical notes and algorithmic derivations are prepared in accordance with the collegiate academic syllabus.
                  </p>
                )}

                <h4 className="font-sans font-bold text-base text-[#102C4B] border-l-4 border-purple-600 pl-3 pt-3">
                  2. Key Formulas & Exam Review Points
                </h4>
                <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-xs text-slate-800 space-y-1.5">
                  <p>• Asymptotic Bounds: O(g(n)), Omega(g(n)), Theta(g(n))</p>
                  <p>• Recurrence Master Theorem: T(n) = a*T(n/b) + f(n)</p>
                  <p>• Space Complexity: Dominant memory overhead in recursion call stack</p>
                  <p>• Time Invariant Systems: S[x(t - t0)] = y(t - t0)</p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Contributed by {resource.uploader_name}</span>
                  <span>Verified for Collegiate Study</span>
                </div>
              </div>
            </div>

            {/* Document Watermark */}
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-300 font-mono select-none">
              XPERTBRIDGE • {resource.original_filename}
            </div>
          </div>
        </div>
        )}

        {/* Bottom Footer Details */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              <Building2 className="w-3.5 h-3.5" />
              {resource.department_code} Department
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(resource.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Direct File Link
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
