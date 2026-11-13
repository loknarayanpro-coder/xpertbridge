import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Users, 
  Zap,
  Download,
  Lock,
  UserPlus,
  LogIn
} from 'lucide-react';

export const LandingAuthFeaturesSection: React.FC = () => {
  const { switchDemoRole } = useAuth();

  return (
    <div className="space-y-16 py-12">
      
      {/* 1. DUAL PORTAL SPOTLIGHT (For Students & For Faculty/Admins) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
            Tailored Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102C4B]">
            Designed for Both Students & Academic Administrators
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Whether you are preparing for semester exams or overseeing curriculum resources, XpertBridge gives you a dedicated workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: For Students */}
          <div className="bg-white rounded-2xl border border-blue-200/90 p-7 sm:p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="space-y-5 relative">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Student Portal
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#102C4B]">
                  For Engineering Students
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Everything you need to master your Computer Science coursework and crack Anna University examinations with high grades.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Unit-Wise Lecture Notes:</strong> Detailed handwritten and typed notes organized by Anna University R2021 units.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Previous Year Question Papers:</strong> Nov/Dec and April/May university papers with solutions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Personal Study Desk:</strong> 1-click bookmarks, offline PDF previews, and submission tracking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Academic Request Board:</strong> Ask peers & faculty for specific missing units or question banks.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center gap-3 relative">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Student Account (Free)</span>
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Student Sign In</span>
              </Link>
            </div>
          </div>

          {/* Card 2: For Faculty & Admins */}
          <div className="bg-white rounded-2xl border border-purple-200/90 p-7 sm:p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="space-y-5 relative">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  Admin Console
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#102C4B]">
                  For Academic Administrators
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Maintain curriculum integrity, moderate student contributions, and track institutional interest across all engineering disciplines.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>1-Click Moderation Queue:</strong> Verify student uploads against Anna University syllabus before publishing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Direct Faculty Uploads:</strong> Instantly publish verified lecture notes and question banks without moderation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Department Rollout Controls:</strong> Manage CSE live status and oversee waitlist demand for ECE, MECH, and AIDS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Curriculum Management:</strong> Add and organize courses across all 8 semesters (R2021).</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center gap-3 relative">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Admin Console</span>
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 2. PLATFORM BENEFITS */}
      <section className="bg-white border-y border-slate-200/80 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-1.5">
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              Academic Excellence
            </span>
            <h2 className="text-2xl font-extrabold text-[#102C4B]">
              Why Engineering Students Choose XpertBridge
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102C4B]">R2021 Syllabus Mapped</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every unit note corresponds strictly to Anna University regulation course codes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102C4B]">In-Browser PDF Viewer</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Read, zoom, paginate, and print study materials instantly without leaving your browser.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102C4B]">Exam PYQ Archive</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete previous examination papers with answer keys for continuous-time convolution and more.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102C4B]">Peer Academic Karma</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Contribute class notes, get verified by faculty, and earn academic karma recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CALL TO ACTION BANNER (Sign Up & Login Gateway) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#102C4B] via-[#1E3A8A] to-[#102C4B] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl space-y-4 relative">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              Join XpertBridge Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Better Notes. Brighter Futures.
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg">
              Create your account in 30 seconds to access verified Computer Science notes, save examination question papers, or moderate curriculum submissions.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up as Student (Free)</span>
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold rounded-xl transition backdrop-blur-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Account</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
