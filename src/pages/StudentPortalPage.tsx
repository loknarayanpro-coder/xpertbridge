import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { dataService } from '../lib/dataService';
import { Resource, Submission, Subject, ResourceRequest } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { PdfViewerModal } from '../components/resources/PdfViewerModal';
import { UploadResourceModal } from '../components/resources/UploadResourceModal';
import { RequestResourceModal } from '../components/resources/RequestResourceModal';
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
  XCircle,
  FileText,
  BookOpen,
  HelpCircle,
  ThumbsUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const StudentPortalPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { bookmarks } = useBookmarks();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'courses';
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [currentSubjects, setCurrentSubjects] = useState<Subject[]>([]);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  // Profile edit state
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [departmentCode, setDepartmentCode] = useState(user?.department_code || 'CSE');
  const [semester, setSemester] = useState(user?.semester?.toString() || '5');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [allSub, allReq, cseSubjects] = await Promise.all([
        dataService.getSubmissions(),
        dataService.getResourceRequests(),
        dataService.getSubjects('dept-cse', user?.semester || 5),
      ]);
      
      if (user) {
        setSubmissions(allSub.filter(s => s.user_id === user.id || s.user_email === user.email));
      }
      setRequests(allReq);
      setCurrentSubjects(cseSubjects);
    }
    loadData();
  }, [user]);

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

  const handleUpvoteRequest = async (id: string) => {
    const newCount = await dataService.voteResourceRequest(id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, votes_count: newCount } : r));
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Student Hub Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-blue-50 shrink-0">
                {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'A'}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#102C4B]">
                    {user?.display_name || user?.email?.split('@')[0] || 'Student'}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-700">
                    Student Workspace
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Reg: R2021
                  </span>
                </div>

                <p className="text-xs text-slate-500">{user?.email || 'student@xpertbridge.edu'}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {user?.college || 'College Campus'}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-blue-700">Computer Science & Engineering</span>
                  <span>•</span>
                  <span>Semester {user?.semester || 5} (3rd Year)</span>
                </div>
              </div>
            </div>

            {/* Actions for Student */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => setIsRequestOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Request Material</span>
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Material</span>
              </button>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 sm:gap-6 border-b border-slate-200 text-xs sm:text-sm font-semibold overflow-x-auto pb-px">
          <button
            onClick={() => setTab('courses')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
              activeTab === 'courses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Courses (CSE Sem {user?.semester || 5})</span>
          </button>

          <button
            onClick={() => setTab('saved')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
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
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
              activeTab === 'submissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>My Contributions ({submissions.length})</span>
          </button>

          <button
            onClick={() => setTab('requests')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Request Board ({requests.length})</span>
          </button>

          <button
            onClick={() => setTab('settings')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Profile</span>
          </button>
        </div>

        {/* TAB 1: MY COURSES & SEMESTER (CSE) */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono tracking-wider text-blue-300 uppercase">
                  Current Curriculum • Anna University R2021
                </span>
                <h3 className="text-xl font-bold">
                  Computer Science & Engineering — Semester {user?.semester || 5}
                </h3>
                <p className="text-xs text-blue-200">
                  Quick access to all unit lecture notes, previous question papers, and lab manuals for this semester.
                </p>
              </div>

              <Link
                to="/notes?dept=CSE"
                className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 text-xs font-semibold rounded-lg shadow-sm transition shrink-0 inline-flex items-center gap-2"
              >
                <span>Browse All CSE Notes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {subject.subject_code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Sem {subject.semester} • {subject.regulation}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#102C4B] group-hover:text-blue-600 transition">
                      {subject.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {subject.description}
                    </p>

                    <div className="pt-2 text-xs text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-700">Course Units:</div>
                      <ul className="text-[11px] text-slate-500 space-y-0.5 list-disc list-inside">
                        {subject.units?.slice(0, 3).map((u) => (
                          <li key={u.unit_number} className="truncate">
                            Unit {u.unit_number}: {u.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/subjects/${subject.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>View Course Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/question-papers?dept=CSE&subject=${subject.subject_code}`}
                      className="text-xs font-medium text-purple-600 hover:text-purple-700"
                    >
                      PYQ Papers
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SAVED BOOKMARKS */}
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
                  Click the bookmark icon on any Computer Science note or question paper to pin it to your personal study desk.
                </p>
                <Link
                  to="/notes"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Explore CSE Notes
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY CONTRIBUTIONS */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#102C4B]">Uploaded Study Materials</h3>
                <p className="text-xs text-slate-500">
                  Track the verification progress of your lecture notes and question papers.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                + Upload New Note
              </button>
            </div>

            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                          sub.moderation_status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.moderation_status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {sub.moderation_status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {sub.moderation_status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {sub.moderation_status === 'pending' && <Clock className="w-3 h-3" />}
                          <span className="capitalize">
                            {sub.moderation_status === 'approved' ? 'Approved & Published' : sub.moderation_status}
                          </span>
                        </span>
                        
                        {sub.moderation_status === 'approved' && (
                          <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            +50 Academic Karma
                          </span>
                        )}

                        <span className="text-xs font-mono text-slate-400">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#102C4B]">
                        {sub.resource.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Course: {sub.resource.subject_code} • {sub.resource.department_code} • Sem {sub.resource.semester} • {sub.resource.file_size_formatted}
                      </p>
                      {sub.reviewer_notes && (
                        <p className="text-xs text-purple-700 bg-purple-50 p-2 rounded-md border border-purple-100 mt-2">
                          <strong>Faculty Feedback:</strong> {sub.reviewer_notes}
                        </p>
                      )}
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
                  Share class notes or past examination papers with your Computer Science community.
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

        {/* TAB 4: RESOURCE REQUEST BOARD */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#102C4B]">Academic Request Board</h3>
                <p className="text-xs text-slate-500">
                  See what study materials fellow CSE students are requesting or submit your own request.
                </p>
              </div>
              <button
                onClick={() => setIsRequestOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <HelpCircle className="w-4 h-4" />
                <span>+ Request Material</span>
              </button>
            </div>

            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {req.subject_code}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {req.subject_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        req.status === 'fulfilled'
                          ? 'bg-emerald-50 text-emerald-700'
                          : req.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {req.status === 'fulfilled' ? 'Fulfilled' : req.status === 'in_progress' ? 'Faculty Sourcing' : 'Open Request'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium">
                      "{req.details}"
                    </p>

                    <div className="text-[11px] text-slate-400">
                      Requested by {req.user_name} • {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => handleUpvoteRequest(req.id)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>{req.votes_count} Upvotes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACCOUNT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 max-w-2xl shadow-sm">
            <h3 className="text-base font-bold text-[#102C4B] mb-4">Edit Student Academic Profile</h3>
            
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
                    <option value="CSE">CSE (Computer Science & Engineering)</option>
                    <option value="ECE">ECE (Available Soon)</option>
                    <option value="EEE">EEE (Available Soon)</option>
                    <option value="MECH">MECH (Available Soon)</option>
                    <option value="CIVIL">CIVIL (Available Soon)</option>
                    <option value="AIDS">AIDS (Available Soon)</option>
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

      <RequestResourceModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onSuccess={async () => {
          const reqs = await dataService.getResourceRequests();
          setRequests(reqs);
        }}
      />
    </div>
  );
};
