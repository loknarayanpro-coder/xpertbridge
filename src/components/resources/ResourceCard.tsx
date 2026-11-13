import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Resource } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useBookmarks } from '../../context/BookmarkContext';
import { dataService } from '../../lib/dataService';
import { materialsService } from '../../lib/materials';
import { AuthRequiredModal } from '../common/AuthRequiredModal';
import { 
  FileText, 
  Download, 
  Bookmark as BookmarkIcon, 
  Lock
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  variant?: 'row' | 'card' | 'compact';
  onQuickView?: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  variant = 'card',
  onQuickView,
}) => {
  const { isAuthenticated } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const navigate = useNavigate();
  const bookmarked = isBookmarked(resource.id);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'open' | 'download' | 'bookmark'>('open');

  const executeDownload = async () => {
    await materialsService.downloadResource(resource);
  };

  const handleCardClick = () => {
    if (!isAuthenticated) {
      setAuthAction('open');
      setAuthModalOpen(true);
      return;
    }
    if (onQuickView) {
      onQuickView(resource);
    } else {
      navigate(`/resources/${resource.id}`);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthAction('download');
      setAuthModalOpen(true);
      return;
    }
    executeDownload();
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthAction('bookmark');
      setAuthModalOpen(true);
      return;
    }
    toggleBookmark(resource);
  };

  // 1. ROW VARIANT (Used in Popular Notes matching reference screenshot exactly)
  if (variant === 'row') {
    return (
      <>
        <div 
          onClick={handleCardClick}
          className="group flex items-center justify-between py-4 px-3 sm:px-4 rounded-xl hover:bg-slate-50/80 transition duration-150 cursor-pointer border-b border-slate-100 last:border-b-0"
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Subtle Purple Document Icon matching reference */}
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center shrink-0 border border-purple-100">
              <FileText className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#102C4B] group-hover:text-blue-600 transition truncate leading-snug">
                {resource.title}
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>{resource.department_code || 'CSE'}</span>
                <span>•</span>
                <span>Sem {resource.semester}</span>
                <span>•</span>
                <span>{resource.units_label || 'Unit 1-4'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            {/* Download count format matching reference: ↓ 2.4k downloads */}
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-normal">
              {!isAuthenticated && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
              <Download className="w-3.5 h-3.5" />
              <span>
                {resource.download_count >= 1000 
                  ? `${(resource.download_count / 1000).toFixed(1)}k downloads` 
                  : `${resource.download_count} downloads`}
              </span>
            </span>
          </div>
        </div>

        <AuthRequiredModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          resource={resource}
          actionType={authAction}
          onSuccess={() => {
            if (authAction === 'download') {
              executeDownload();
            } else if (onQuickView) {
              onQuickView(resource);
            } else {
              navigate(`/resources/${resource.id}`);
            }
          }}
        />
      </>
    );
  }

  // 2. CARD VARIANT (Used in Recently Added grid matching reference screenshot)
  return (
    <>
      <div 
        onClick={handleCardClick}
        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
      >
        <div className="p-5">
          
          {/* Purple Document Icon matching reference */}
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center shrink-0 border border-purple-100 mb-4 flex items-center justify-between">
            <FileText className="w-5 h-5" />
          </div>

          {/* Title */}
          <h4 className="text-sm sm:text-base font-bold text-[#102C4B] group-hover:text-blue-600 transition line-clamp-1 leading-snug">
            {resource.title}
          </h4>

          {/* Metadata: CSE • Sem 5 • Unit 3 */}
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <span>{resource.department_code || 'CSE'}</span>
            <span>•</span>
            <span>Sem {resource.semester}</span>
            <span>•</span>
            <span>{resource.units_label || 'Unit 1-3'}</span>
          </p>

          {/* Badges matching reference: [Notes] [Important Questions] [PDF] */}
          <div className="flex items-center gap-1.5 mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium ${
              resource.resource_type === 'question_paper'
                ? 'bg-[#F5F3FF] text-[#7C3AED]'
                : resource.resource_type === 'important_questions'
                ? 'bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold'
                : 'bg-blue-50 text-blue-600'
            }`}>
              {resource.resource_type === 'question_paper' 
                ? 'Question Paper' 
                : resource.resource_type === 'important_questions'
                ? 'Important Questions'
                : 'Notes'}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
              PDF
            </span>
            {!isAuthenticated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 ml-auto">
                <Lock className="w-2.5 h-2.5" />
                Sign in to open
              </span>
            )}
          </div>
        </div>

        {/* Bottom row: Uploader Avatar + Name + Relative time on left, Download icon on right */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 min-w-0">
            {resource.uploader_avatar ? (
              <img
                src={resource.uploader_avatar}
                alt={resource.uploader_name}
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                {resource.uploader_name.charAt(0)}
              </div>
            )}
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-semibold text-slate-700 text-xs truncate">
                {resource.uploader_name}
              </span>
              <span className="text-[10px] text-slate-400">
                {resource.created_at.includes('2026-10-24') ? '2 days ago' :
                 resource.created_at.includes('2026-10-23') ? '3 days ago' :
                 resource.created_at.includes('2026-10-22') ? '4 days ago' :
                 resource.created_at.includes('2026-10-21') ? '5 days ago' : 'Recently'}
              </span>
            </div>
          </div>

          {resource.storage_path && resource.storage_path.trim() !== '' && !resource.storage_path.startsWith('demo/') ? (
            <button
              onClick={handleDownload}
              title={isAuthenticated ? 'Download file' : 'Sign in required to download'}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {!isAuthenticated && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
              <Download className="w-4 h-4" />
            </button>
          ) : (
            <div
              title="No document file uploaded yet"
              className="p-1.5 text-slate-300 rounded-lg shrink-0 flex items-center gap-1 cursor-not-allowed select-none"
            >
              <div className="relative inline-flex items-center justify-center">
                <Download className="w-4 h-4 text-slate-300" />
                <span className="absolute w-5 h-[2px] bg-rose-500 rotate-45 transform shadow-xs" />
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthRequiredModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        resource={resource}
        actionType={authAction}
        onSuccess={() => {
          if (authAction === 'download') {
            executeDownload();
          } else if (onQuickView) {
            onQuickView(resource);
          } else {
            navigate(`/resources/${resource.id}`);
          }
        }}
      />
    </>
  );
};
