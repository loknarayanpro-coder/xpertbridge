import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { dataService } from '../lib/dataService';
import { Resource, Submission } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { PdfViewerModal } from '../components/resources/PdfViewerModal';
import { UploadResourceModal } from '../components/resources/UploadResourceModal';
import { 
  User, 
  Bookmark as BookmarkIcon, 
  UploadCloud, 
  Settings, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isAdmin, updateProfile } = useAuth();
  const { bookmarks } = useBookmarks();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'saved';
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Profile edit state
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [departmentCode, setDepartmentCode] = useState(user?.department_code || 'CSE');
  const [semester, setSemester] = useState(user?.semester?.toString() || '5');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    async function loadSubmissions() {
      const allSub = await dataService.getSubmissions();
      // Filter by current user
      if (user) {
        setSubmissions(allSub.filter(s => s.user_id === user.id || s.user_email === user.email));
      }
    }
    loadSubmissions();
  }, [user, isAuthenticated, navigate]);

  const setTab = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      display_name: displayName,
      college,
      department_code: departmentCode,
      semester: parseInt(semester, 10),
      academic_year: Math.ceil(parseInt(semester, 10) / 2),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-blue-50">
                {user.display_name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#102C4B]">
                    {user.display_name}
                  </h1>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                    isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isAdmin ? 'Administrator' : 'Student'}
                  </span>
                </div>

                <p className="text-xs text-slate-500">{user.email}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {user.college || 'Suryodaya Institute'}
                  </span>
                  <span>•</span>
                  <span>{user.department_code || 'CSE'} Department</span>
                  <span>•</span>
                  <span>Semester {user.semester || 5}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Material</span>
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-slate-200 text-sm font-semibold">
          <button
            onClick={() => setTab('saved')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 ${
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            <span>Saved Bookmarks ({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setTab('submissions')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 ${
              activeTab === 'submissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>My Contributions ({submissions.length})</span>
          </button>

          <button
            onClick={() => setTab('settings')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* Tab 1: Saved Bookmarks */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookmarks.map((bm) => (
                  bm.resource ? (
                    <ResourceCard
                      key={bm.id}
                      resource={bm.resource}
                      variant="card"
                      onQuickView={(r) => setPreviewResource(r)}
                    />
                  ) : null
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <BookmarkIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#102C4B]">No saved bookmarks yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Click the bookmark icon on any note or question paper to save it to your personal quick-access library.
                </p>
                <Link
                  to="/notes"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Explore Notes
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Contributions */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                          sub.moderation_status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.moderation_status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {sub.moderation_status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {sub.moderation_status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {sub.moderation_status === 'pending' && <Clock className="w-3 h-3" />}
                          <span className="capitalize">{sub.moderation_status}</span>
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#102C4B]">
                        {sub.resource.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {sub.resource.subject_code} • {sub.resource.department_code} • Sem {sub.resource.semester}
                      </p>
                    </div>

                    <button
                      onClick={() => setPreviewResource(sub.resource)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition self-start sm:self-auto"
                    >
                      Preview File
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#102C4B]">No materials uploaded yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Share class notes or past examination papers with your college community.
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Upload First Document
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 max-w-2xl shadow-sm">
            <h3 className="text-base font-bold text-[#102C4B] mb-4">Edit Student Information</h3>
            
            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile details successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College or Institution
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="AIDS">AIDS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

      </div>

      <PdfViewerModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      <UploadResourceModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};
