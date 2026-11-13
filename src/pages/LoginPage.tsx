import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { 
  User, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Bookmark, 
  Users, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const redirectPath = searchParams.get('redirect') || '';
  const msgParam = searchParams.get('msg') || '';
  const roleParam = searchParams.get('role');

  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>(roleParam === 'admin' ? 'admin' : 'student');
  const [email, setEmail] = useState(roleParam === 'admin' ? 'loknarayanpro@gmail.com' : 'student@xpertbridge.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (roleParam === 'admin') {
      setSelectedRole('admin');
      setEmail('loknarayanpro@gmail.com');
    }
  }, [roleParam]);

  const handleRoleSelect = (role: 'student' | 'admin') => {
    setSelectedRole(role);
    if (role === 'student') {
      setEmail('student@xpertbridge.edu');
    } else {
      setEmail('loknarayanpro@gmail.com');
    }
    setErrorMsg(null);
  };

  const getDestination = (role: 'student' | 'admin') => {
    if (redirectPath) {
      try {
        const decoded = decodeURIComponent(redirectPath);
        // If a student is logging in, never redirect them to /admin
        if (role === 'student' && decoded.includes('/admin')) {
          return '/student';
        }
        return decoded;
      } catch {
        if (role === 'student' && redirectPath.includes('/admin')) {
          return '/student';
        }
        return redirectPath;
      }
    }
    return role === 'admin' ? '/admin' : '/student';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate(getDestination(selectedRole));
    } else {
      setErrorMsg(res.error || 'Failed to sign in. Please check credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const targetEmail = selectedRole === 'admin' ? 'loknarayanpro@gmail.com' : 'student@xpertbridge.edu';
    await login(targetEmail);
    setLoading(false);
    navigate(getDestination(selectedRole));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Mobile Top Header (with back arrow & logo as in reference) */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between lg:hidden">
        <Link 
          to="/" 
          aria-label="Back to Home"
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link to="/" className="inline-block">
          <Logo size="sm" />
        </Link>
        <div className="w-9" />
      </header>

      {/* Main Center Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
          
          {/* Left Column: Welcome & Brand Showcase */}
          <div className="lg:col-span-6 bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-white p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
            <div>
              {/* Brand Logo inside column */}
              <div className="mb-6">
                <Logo size="md" />
              </div>

              {/* Illustration with soft glowing circular halo */}
              <div className="relative w-full max-w-[320px] mx-auto aspect-square mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 via-cyan-100/30 to-blue-300/30 rounded-full blur-2xl transform -translate-y-2 pointer-events-none" />
                <img 
                  src="/assets/login-illustration.jpg" 
                  alt="XpertBridge Academic Illustration" 
                  className="relative z-10 w-full h-full object-contain drop-shadow-md rounded-2xl"
                  onError={(e) => {
                    // Fallback to stylized SVG if image not yet loaded
                    e.currentTarget.style.display = 'none';
                    const fallback = document.getElementById('login-fallback-svg');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />

                {/* Styled SVG Fallback Container */}
                <div 
                  id="login-fallback-svg" 
                  style={{ display: 'none' }}
                  className="relative z-10 w-full h-full flex items-center justify-center"
                >
                  <div className="w-48 h-48 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center relative shadow-inner">
                    <BookOpen className="w-20 h-20 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Headline & Subhead */}
              <div className="text-left space-y-1.5 mb-7">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome Back!
                </h1>
                <p className="text-sm text-slate-500 font-normal leading-relaxed">
                  Sign in to access your notes, question papers and more.
                </p>
              </div>

              {/* Feature Benefit List */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80 transition group-hover:scale-105">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">
                    Access college notes and study materials
                  </span>
                </div>

                <div className="flex items-center gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80 transition group-hover:scale-105">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">
                    Track your learning progress
                  </span>
                </div>

                <div className="flex items-center gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80 transition group-hover:scale-105">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">
                    Stay connected with your college community
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Support Link */}
            <div className="pt-8 mt-6 border-t border-slate-100 text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link 
                to="/contact" 
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                Contact your college admin
              </Link>
            </div>
          </div>

          {/* Right Column: Sign In Form */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white">
            <div className="space-y-6">
              
              {/* Form Header */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Sign In
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-normal">
                  Choose your role to continue
                </p>
              </div>

              {/* Role Toggle Switch: [Student | Admin] */}
              <div className="bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selectedRole === 'student'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selectedRole === 'admin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 text-slate-800 transition"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 text-slate-800 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 rounded-sm cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <a 
                    href="#forgot" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Demo Mode: Password reset is pre-configured. Use email: ${email} with any demo password.`);
                    }}
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  OR
                </span>
              </div>

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-3 shadow-xs hover:border-slate-300 cursor-pointer"
              >
                {/* Official Google Multi-Color G Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

            </div>

            {/* Terms & Privacy Policy Footer */}
            <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-400 leading-relaxed">
              By signing in, you agree to our{' '}
              <a href="#terms" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </div>

          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 XpertBridge. Learn • Prepare • Grow. All rights reserved.
      </footer>

    </div>
  );
};
