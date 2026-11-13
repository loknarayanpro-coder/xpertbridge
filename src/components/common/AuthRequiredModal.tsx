import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Resource } from '../../types';
import { 
  X, 
  Lock, 
  FileText, 
  Download, 
  Sparkles, 
  ArrowRight, 
  User, 
  CheckCircle2,
  LogIn
} from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: Resource | null;
  actionType?: 'open' | 'download' | 'bookmark' | 'upload';
  onSuccess?: () => void;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  resource,
  actionType = 'open',
  onSuccess,
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleInstantStudentLogin = async () => {
    await login('student@xpertbridge.edu');
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleGoToLogin = () => {
    const redirectUrl = resource 
      ? `/resources/${resource.id}` 
      : window.location.pathname + window.location.search;
    navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}&msg=auth_required`);
    onClose();
  };

  const actionTitle = 
    actionType === 'download' 
      ? 'Sign In Required to Download' 
      : actionType === 'upload'
      ? 'Sign In Required to Upload Notes'
      : actionType === 'bookmark'
      ? 'Sign In Required to Save'
      : 'Sign In Required to Open Document';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon with soft glowing aura */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100 shadow-inner relative">
          <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-lg pointer-events-none" />
          <Lock className="w-6 h-6 relative z-10" />
        </div>

        {/* Header */}
        <h3 className="text-xl font-extrabold text-[#102C4B] tracking-tight">
          {actionTitle}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Students can browse the catalog freely. Please sign in to read full unit notes, open the PDF reader, and download documents.
        </p>

        {/* Selected Resource Metadata Snippet */}
        {resource && (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 truncate">
                {resource.title}
              </h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>{resource.subject_code}</span>
                <span>•</span>
                <span>Sem {resource.semester}</span>
                <span>•</span>
                <span className="font-mono text-slate-600">{resource.file_size_formatted}</span>
              </p>
            </div>
          </div>
        )}

        {/* Unlocked Benefits list */}
        <div className="mt-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Full in-browser PDF reader & lecture slides</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>High-speed offline PDF & question paper downloads</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Save to personal Student Desk bookmarks</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          {/* 1-Click Instant Demo Button */}
          <button
            type="button"
            onClick={handleInstantStudentLogin}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Instant Student Access (Demo)</span>
          </button>

          {/* Standard Sign In Link */}
          <button
            type="button"
            onClick={handleGoToLogin}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Sign In to Account</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          New student?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/signup');
            }}
            className="text-blue-600 hover:underline font-semibold"
          >
            Join free in 30 seconds
          </button>
        </div>

      </div>
    </div>
  );
};
