import React, { useEffect } from 'react';
import { useBookmarks } from '../../context/BookmarkContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useBookmarks();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#102C4B] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700/60 text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="font-medium text-slate-100">{toastMessage}</span>
      <button
        onClick={clearToast}
        className="text-slate-400 hover:text-white ml-2 p-0.5 rounded transition"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
