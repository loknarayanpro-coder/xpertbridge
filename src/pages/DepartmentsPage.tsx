import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Department, Subject } from '../types';
import { dataService } from '../lib/dataService';
import { 
  Building2, 
  Code, 
  Cpu, 
  Zap, 
  Settings, 
  Database, 
  ArrowRight,
  Search,
  Clock,
  Sparkles,
  Bell,
  CheckCircle2,
  X
} from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [notifyModalDept, setNotifyModalDept] = useState<Department | null>(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySent, setNotifySent] = useState(false);

  useEffect(() => {
    async function load() {
      const [depts, subs] = await Promise.all([
        dataService.getDepartments(),
        dataService.getSubjects(),
      ]);
      setDepartments(depts);
      setSubjects(subs);
    }
    load();
  }, []);

  const getIcon = (iconName: string, isActive: boolean) => {
    const className = `w-6 h-6 ${isActive ? 'text-blue-600' : 'text-slate-400'}`;
    switch (iconName) {
      case 'code':
        return <Code className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'settings':
        return <Settings className={className} />;
      case 'building':
        return <Building2 className={className} />;
      case 'database':
        return <Database className={className} />;
      default:
        return <Building2 className={className} />;
    }
  };

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail.trim()) {
      setNotifySent(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Collegiate Academic Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102C4B] tracking-tight">
            Academic Departments
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Currently active for Computer Science & Engineering. Study resources for additional engineering branches are being curated and will be available soon.
          </p>

          {/* Search */}
          <div className="mt-5 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search department by name or code (e.g. CSE, ECE)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Current Active Announcement */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102C4B]">
                Computer Science & Engineering is Fully Live
              </h3>
              <p className="text-xs text-slate-600">
                Explore complete unit-wise lecture notes, syllabi, and past university examination papers. Other branches will be unlocked soon.
              </p>
            </div>
          </div>
          <Link
            to="/notes?dept=CSE"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shadow-sm shrink-0 self-start sm:self-auto"
          >
            Browse CSE Resources
          </Link>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dept) => {
            const isCSE = dept.code === 'CSE';
            const deptSubjects = subjects.filter(s => s.department_id === dept.id || s.department_code === dept.code);

            return (
              <div
                key={dept.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between ${
                  isCSE 
                    ? 'border-blue-400 shadow-sm ring-1 ring-blue-400/20' 
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                      isCSE ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'
                    }`}>
                      {getIcon(dept.icon_name, isCSE)}
                    </div>

                    {isCSE ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-md border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Available Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold text-xs rounded-md border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Available Soon
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {dept.code}
                    </span>
                    <span className="text-slate-300">•</span>
                    <h3 className="text-base font-bold text-[#102C4B] leading-snug">
                      {dept.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {dept.description}
                  </p>

                  {/* Core Subjects List for CSE */}
                  {isCSE && deptSubjects.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Active Courses
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {deptSubjects.slice(0, 4).map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/subjects/${sub.id}`}
                            className="px-2 py-0.5 bg-blue-50/70 hover:bg-blue-100 text-blue-700 rounded text-[11px] border border-blue-100 transition"
                          >
                            {sub.subject_code}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isCSE && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-500 space-y-1">
                      <p className="font-medium text-slate-700">Under Active Curation</p>
                      <p className="text-[11px]">
                        Subject notes, formula sheets, and past question papers for {dept.name} are currently being organized.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isCSE ? (
                    <>
                      <Link
                        to="/notes?dept=CSE"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1.5"
                      >
                        <span>Browse CSE Notes</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to="/question-papers?dept=CSE"
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 transition"
                      >
                        Papers
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setNotifyModalDept(dept);
                        setNotifySent(false);
                        setNotifyEmail('');
                      }}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1.5 transition"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify me when ready</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Notify Modal */}
      {notifyModalDept && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <button
                onClick={() => setNotifyModalDept(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Available Soon
              </span>
              <h3 className="text-lg font-bold text-[#102C4B] mt-2">
                {notifyModalDept.name} ({notifyModalDept.code})
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                We are currently focusing on Computer Science & Engineering. Resources for {notifyModalDept.name} will be added in upcoming releases.
              </p>
            </div>

            {notifySent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center font-medium">
                Thank you! We will email you once {notifyModalDept.code} resources become available.
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Your College Email:
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shrink-0"
                  >
                    Notify Me
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 flex items-center justify-end border-t border-slate-100">
              <button
                onClick={() => setNotifyModalDept(null)}
                className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
