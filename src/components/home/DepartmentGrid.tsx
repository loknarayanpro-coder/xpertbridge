import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Department } from '../../types';
import { 
  Code, 
  Cpu, 
  Zap, 
  Settings, 
  Building2, 
  Database, 
  ArrowRight,
  Clock,
  Sparkles,
  X,
  Bell
} from 'lucide-react';

interface DepartmentGridProps {
  departments: Department[];
}

export const DepartmentGrid: React.FC<DepartmentGridProps> = ({ departments }) => {
  const navigate = useNavigate();
  const [comingSoonDept, setComingSoonDept] = useState<Department | null>(null);
  const [notified, setNotified] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'code':
        return <Code className="w-5 h-5 text-blue-600" />;
      case 'cpu':
        return <Cpu className="w-5 h-5 text-slate-500" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-slate-500" />;
      case 'settings':
        return <Settings className="w-5 h-5 text-slate-500" />;
      case 'building':
        return <Building2 className="w-5 h-5 text-slate-500" />;
      case 'database':
        return <Database className="w-5 h-5 text-slate-500" />;
      default:
        return <Code className="w-5 h-5 text-blue-600" />;
    }
  };

  const featured = departments.slice(0, 4);

  const handleCardClick = (e: React.MouseEvent, dept: Department) => {
    if (dept.code !== 'CSE' && dept.status === 'coming_soon') {
      e.preventDefault();
      setComingSoonDept(dept);
      setNotified(false);
      setNotifyEmail('');
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail.trim()) {
      setNotified(true);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching reference */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102C4B] tracking-tight">
              Explore by Department
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find notes and question papers for your department and semester.
            </p>
          </div>

          <Link
            to="/departments"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition shrink-0"
          >
            <span>View all departments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Department Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((dept) => {
            const isCSE = dept.code === 'CSE';
            return (
              <div
                key={dept.id}
                onClick={(e) => handleCardClick(e, dept)}
                className={`group p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isCSE
                    ? 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'
                    : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    {/* Department Icon Pill */}
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                      isCSE 
                        ? 'bg-blue-50 border-blue-100/80 group-hover:bg-blue-100' 
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      {getIcon(dept.icon_name)}
                    </div>

                    {/* Status Badge */}
                    {isCSE ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Available Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Available Soon
                      </span>
                    )}
                  </div>

                  {/* Department Name */}
                  <h3 className={`text-sm sm:text-base font-bold leading-snug transition ${
                    isCSE ? 'text-[#102C4B] group-hover:text-blue-600' : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {dept.name}
                  </h3>
                </div>

                {/* Bottom row: Department Code and Arrow */}
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100">
                  <span className={`text-xs font-mono font-medium ${
                    isCSE ? 'text-slate-500 font-bold group-hover:text-blue-600' : 'text-slate-400'
                  }`}>
                    {dept.code}
                  </span>

                  {isCSE ? (
                    <Link
                      to={`/notes?dept=${dept.code}`}
                      className="text-slate-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-150"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <span className="text-slate-300 group-hover:text-amber-600 transition">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Coming Soon Modal */}
      {comingSoonDept && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <button
                onClick={() => setComingSoonDept(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Coming Soon
              </span>
              <h3 className="text-lg font-bold text-[#102C4B] mt-2">
                {comingSoonDept.name} ({comingSoonDept.code})
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                Our academic toppers committee is currently collecting, verifying, and digitizing unit-wise notes and previous-year question papers for {comingSoonDept.code}.
              </p>
              <div className="mt-3 p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Currently Available: Computer Science & Engineering
                </p>
                <p className="text-[11px] text-blue-600">
                  You can explore our complete archive of Data Structures, DBMS, OS, Networks, and compiler design notes.
                </p>
              </div>
            </div>

            {notified ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center font-medium">
                Thank you! We&apos;ll notify you when {comingSoonDept.code} materials are published.
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Notify me when available:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shrink-0 flex items-center gap-1"
                  >
                    <Bell className="w-3 h-3" />
                    <span>Notify</span>
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setComingSoonDept(null)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setComingSoonDept(null);
                  navigate('/notes?dept=CSE');
                }}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Browse CSE Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
