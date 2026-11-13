import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useBookmarks } from '../../context/BookmarkContext';
import { 
  Search, 
  Bookmark as BookmarkIcon, 
  User, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  BookOpen,
  FileText,
  Building2,
  Info,
  UserPlus,
  LogIn
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { bookmarkedIds } = useBookmarks();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[13px] font-medium transition-colors hover:text-blue-600 py-1 ${
      isActive
        ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
        : 'text-slate-700'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Brand Logo matching reference */}
          <div className="flex items-center gap-10 shrink-0">
            <Logo showTagline={true} size="md" />
            
            {/* Desktop Navigation matching reference order: Home, Notes, Question Papers, Departments, About */}
            <nav className="hidden md:flex items-center gap-7">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/notes" className={navLinkClass}>
                Notes
              </NavLink>
              <NavLink to="/question-papers" className={navLinkClass}>
                Question Papers
              </NavLink>
              <NavLink to="/departments" className={navLinkClass}>
                Departments
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
            </nav>
          </div>

          {/* Search bar, Role Switcher & User Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Pill Search Input matching reference */}
            <form onSubmit={handleSearchSubmit} className="relative w-52 lg:w-64 hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search CSE notes, codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800 placeholder:text-slate-400 transition"
              />
            </form>

            {/* Conditional Authentication View */}
            {isAuthenticated ? (
              <>
                {/* Quick 1-Click Role Switcher (Student vs Admin) */}
                <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAdmin) {
                        navigate('/student');
                      }
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
                      !isAdmin 
                        ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Active as Student"
                  >
                    <User className="w-3 h-3" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isAdmin) {
                        navigate('/admin');
                      }
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
                      isAdmin 
                        ? 'bg-purple-600 text-white font-semibold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Active as Academic Administrator"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin</span>
                  </button>
                </div>

                {/* Dedicated Role Link Button */}
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-full transition shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Admin Console</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Submissions awaiting review" />
                  </Link>
                ) : (
                  <Link
                    to="/student"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full transition shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Student Hub</span>
                  </Link>
                )}

                {/* User Profile Avatar matching reference (Blue circular button) */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={`w-9 h-9 rounded-full text-white flex items-center justify-center transition shadow-sm focus:outline-none ring-2 ${
                      isAdmin 
                        ? 'bg-purple-600 hover:bg-purple-700 ring-purple-100' 
                        : 'bg-blue-600 hover:bg-blue-700 ring-blue-50'
                    }`}
                    aria-label="User account"
                    aria-expanded={profileOpen}
                  >
                    {isAdmin ? <ShieldCheck className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                  </button>

                  {profileOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseLeave={() => setProfileOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-[#102C4B] truncate">{user?.display_name || (isAdmin ? 'Admin' : 'Student')}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                            isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isAdmin ? 'Academic Administrator' : `${user?.department_code || 'CSE'} • Sem ${user?.semester || 5}`}
                          </span>
                        </div>
                      </div>

                      {/* Student links */}
                      <Link
                        to="/student"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        Student Dashboard & Hub
                      </Link>

                      <Link
                        to="/student?tab=saved"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <BookmarkIcon className="w-4 h-4 text-slate-400" />
                        Saved Bookmarks ({bookmarkedIds.size})
                      </Link>

                      <Link
                        to="/student?tab=submissions"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        My Contributions & Uploads
                      </Link>

                      {/* Admin Direct Access */}
                      <div className="border-t border-slate-100 my-1 pt-1">
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-purple-700 font-semibold hover:bg-purple-50 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          Admin Console & Moderation
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={async () => {
                            setProfileOpen(false);
                            await logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Unauthenticated Guest Actions */
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full shadow-2xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Join Free</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes, subjects, codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </form>

          <nav className="flex flex-col space-y-1 pt-2">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              Home
            </NavLink>
            <NavLink
              to="/notes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              Notes
            </NavLink>
            <NavLink
              to="/question-papers"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Question Papers
            </NavLink>
            <NavLink
              to="/departments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Building2 className="w-4 h-4 text-slate-600" />
              Departments
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Info className="w-4 h-4 text-slate-600" />
              About
            </NavLink>

            {/* Mobile Auth Actions */}
            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Sign In to Account</span>
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Free Student Account</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
