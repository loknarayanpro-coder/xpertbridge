import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  FileText,
  ArrowRight,
  LogIn
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<'student' | 'faculty'>('student');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('Suryodaya Institute of Engineering & Technology');
  const [departmentCode, setDepartmentCode] = useState('CSE');
  const [academicYear, setAcademicYear] = useState('3');
  const [semester, setSemester] = useState('5');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const res = await signup({
      email,
      password,
      display_name: displayName,
      college,
      department_code: departmentCode,
      academic_year: parseInt(academicYear, 10),
      semester: parseInt(semester, 10),
    });

    setLoading(false);
    if (res.success) {
      navigate(accountType === 'faculty' ? '/admin' : '/student');
    } else {
      setErrorMsg(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Top Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block hover:opacity-90 transition">
            <Logo size="lg" />
          </Link>
        </div>

        {/* 2-Column Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Brand & Benefits */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#102C4B] via-[#1E3A8A] to-[#102C4B] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6 relative">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-white/10 text-cyan-300 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                Free Academic Registration
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Join 1,200+ Students & Faculty on XpertBridge
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Gain instant access to unit-wise Computer Science lecture notes, Anna University past examination papers, and an academic request board.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>100% Free for College Students</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Fast in-browser PDF reader & offline saving</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Personal Study Desk & Bookmark Manager</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Contribute materials & earn Academic Karma</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 text-xs text-slate-300 relative">
              <p className="font-semibold text-white">Have questions?</p>
              <p className="text-[11px] text-slate-300 mt-0.5">Contact the academic platform team at support@xpertbridge.edu</p>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              
              <div>
                <h3 className="text-2xl font-extrabold text-[#102C4B]">
                  Create an Account
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your academic profile details to get started.
                </p>
              </div>

              {/* Account Type Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAccountType('student')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      accountType === 'student'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('faculty')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      accountType === 'faculty'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Faculty / Admin</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={accountType === 'faculty' ? 'e.g. Dr. Ramesh Sundaram' : 'e.g. Aravind Sharma'}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={accountType === 'faculty' ? 'faculty@college.edu' : 'student@campus.edu'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={departmentCode}
                      onChange={(e) => setDepartmentCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value="CSE">CSE (Active Focus)</option>
                      <option value="ECE">ECE (Coming Soon)</option>
                      <option value="EEE">EEE (Coming Soon)</option>
                      <option value="MECH">MECH (Coming Soon)</option>
                      <option value="CIVIL">CIVIL (Coming Soon)</option>
                      <option value="AIDS">AIDS (Coming Soon)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {accountType === 'faculty' ? 'Assigned Year' : 'Semester'}
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => {
                        const s = parseInt(e.target.value, 10);
                        setSemester(e.target.value);
                        setAcademicYear(Math.ceil(s / 2).toString());
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s.toString()}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 text-white font-semibold rounded-lg text-xs shadow-sm transition flex items-center justify-center gap-2 mt-2 ${
                    accountType === 'faculty'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create {accountType === 'faculty' ? 'Faculty / Admin' : 'Student'} Account</span>
                    </>
                  )}
                </button>
              </form>

            </div>

            <div className="pt-4 text-center text-xs text-slate-500 border-t border-slate-100">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                Sign in here →
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
