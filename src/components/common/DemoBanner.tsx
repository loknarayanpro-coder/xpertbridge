import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { dataService } from '../../lib/dataService';
import { Shield, User, Database, RefreshCw, X } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user, isAdmin, switchDemoRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all mock modifications (uploads, admin edits, bookmarks) to default state?')) {
      dataService.resetToDefaults();
      window.location.reload();
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-40 bg-[#102C4B] text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg hover:bg-slate-800 transition flex items-center gap-1.5 border border-slate-700"
      >
        <Database className="w-3.5 h-3.5 text-cyan-400" />
        <span>{isSupabaseConfigured ? 'Supabase' : 'Demo Mode'}</span>
      </button>
    );
  }

  return (
    <aside aria-label="Environment and role switcher" className="bg-[#0f172a] text-slate-200 border-b border-slate-800 px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-medium text-[11px] ${
            isSupabaseConfigured 
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
              : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            <Database className="w-3 h-3" />
            {isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode (Fictional Sample Data)'}
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            {isSupabaseConfigured 
              ? 'Connected to PostgreSQL & Cloud Storage' 
              : 'Interactive prototype with local state persistence'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-slate-400 text-[11px]">Active Persona:</span>
              
              <button
                onClick={() => switchDemoRole('student')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                  !isAdmin 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <User className="w-3 h-3" />
                Student (Aravind)
              </button>

              <button
                onClick={() => switchDemoRole('admin')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                  isAdmin 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Shield className="w-3 h-3" />
                Admin (Dean)
              </button>
            </>
          ) : (
            <>
              <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                <span>🔒 Content Locked</span>
              </span>
              <span className="hidden sm:inline text-slate-400 text-[11px]">Instant Access:</span>
              
              <button
                onClick={() => switchDemoRole('student')}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1 shadow-sm"
              >
                <User className="w-3 h-3" />
                <span>Demo Student</span>
              </button>

              <button
                onClick={() => switchDemoRole('admin')}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-600 hover:bg-purple-700 text-white transition flex items-center gap-1 shadow-sm"
              >
                <Shield className="w-3 h-3" />
                <span>Demo Admin</span>
              </button>
            </>
          )}

          {!isSupabaseConfigured && (
            <button
              onClick={handleReset}
              title="Reset mock changes to fresh initial state"
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition ml-1"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => setCollapsed(true)}
            title="Minimize banner"
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
