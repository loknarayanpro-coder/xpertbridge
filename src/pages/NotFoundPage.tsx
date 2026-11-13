import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="mb-4">
        <Logo size="lg" />
      </div>
      <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
        404 — Page Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102C4B] mt-4 mb-2">
        Looking for a study resource?
      </h1>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
        The link you followed may be broken or the academic resource has been reorganized.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Home className="w-4 h-4" />
          <span>Go to Homepage</span>
        </Link>
        <Link
          to="/notes"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
        >
          <span>Browse Notes</span>
        </Link>
      </div>
    </div>
  );
};
