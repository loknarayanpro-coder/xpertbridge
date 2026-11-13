import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../lib/dataService';
import { Department, Subject, Resource, Submission, ResourceRequest } from '../types';
import { PdfViewerModal } from '../components/resources/PdfViewerModal';
import { UploadResourceModal } from '../components/resources/UploadResourceModal';
import { 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Plus, 
  Building2, 
  Eye, 
  Download,
  AlertTriangle,
  Lock,
  User,
  HelpCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Bell,
  ArrowRight,
  Send
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'submissions' | 'resources' | 'departments' | 'subjects' | 'requests'>('submissions');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [waitlistCounts, setWaitlistCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters for All Resources tab
  const [resourceSemFilter, setResourceSemFilter] = useState('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');

  // New Subject Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubDept, setNewSubDept] = useState('dept-cse');
  const [newSubSem, setNewSubSem] = useState('5');
  const [newSubReg, setNewSubReg] = useState('R2021');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [depts, subs, res, subms, reqs] = await Promise.all([
        dataService.getDepartments(),
        dataService.getSubjects(),
        dataService.getAllResourcesAdmin(),
        dataService.getSubmissions(),
        dataService.getResourceRequests(),
      ]);
      setDepartments(depts);
      setSubjects(subs);
      setResources(res);
      setSubmissions(subms);
      setRequests(reqs);
      setWaitlistCounts(dataService.getDepartmentWaitlistCounts());
    } catch (err) {
      console.error('Admin data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#102C4B]">Administrator Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This dashboard is restricted to academic staff and platform administrators for resource moderation and curriculum management.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                switchDemoRole('admin');
                loadAdminData();
              }}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Switch to Demo Admin Persona (Prof. Vikram Raman)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.moderation_status === 'pending');
  const totalDownloads = resources.reduce((acc, r) => acc + (r.download_count || 0), 0);
  const totalWaitlistedStudents = Object.values(waitlistCounts).reduce((a, b) => a + b, 0);

  const handleReviewSubmission = async (id: string, status: 'approved' | 'rejected') => {
    const notes = status === 'approved' ? 'Verified syllabus alignment for CSE' : 'Document quality does not meet academic standards';
    await dataService.reviewSubmission(id, status, user?.id || 'admin', notes);
    showToast(status === 'approved' ? 'Submission approved and published to catalog!' : 'Submission rejected.');
    await loadAdminData();
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (window.confirm(`Permanently remove "${title}" from the platform archive?`)) {
      await dataService.deleteResource(id);
      showToast('Resource removed.');
      await loadAdminData();
    }
  };

  const handleToggleDepartment = async (id: string) => {
    const updated = await dataService.toggleDepartmentStatus(id);
    if (updated) {
      showToast(`Department "${updated.name}" is now ${updated.status === 'active' ? 'Active' : 'Available Soon'}`);
      await loadAdminData();
    }
  };

  const handleFulfillRequest = async (id: string) => {
    await dataService.fulfillResourceRequest(id);
    showToast('Request marked as fulfilled!');
    await loadAdminData();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubCode || !newSubDept) return;
    const dept = departments.find(d => d.id === newSubDept);
    await dataService.createSubject({
      name: newSubName.trim(),
      subject_code: newSubCode.trim().toUpperCase(),
      department_id: newSubDept,
      department_code: dept?.code || 'CSE',
      semester: parseInt(newSubSem, 10),
      academic_year: Math.ceil(parseInt(newSubSem, 10) / 2),
      regulation: newSubReg,
      description: newSubDesc.trim() || `Core coursework for ${newSubName}.`,
      units: [
        { unit_number: 1, title: 'Introduction & Foundations', description: 'Core principles and definitions.' },
        { unit_number: 2, title: 'Analysis & Methods', description: 'Theoretical models and algorithms.' },
        { unit_number: 3, title: 'Advanced Applications', description: 'Real-world system implementations.' },
      ],
    });
    setNewSubName('');
    setNewSubCode('');
    setNewSubDesc('');
    setIsSubModalOpen(false);
    showToast(`Added ${newSubCode} to curriculum.`);
    await loadAdminData();
  };

  // Filtered resources
  const filteredResources = resources.filter(r => {
    if (resourceSemFilter !== 'all' && r.semester.toString() !== resourceSemFilter) return false;
    if (resourceTypeFilter !== 'all' && r.resource_type !== resourceTypeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#102C4B] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header with Switch to Student button */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102C4B]">
                  Administrative Console
                </h1>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md">
                  Prof. Vikram Raman
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
                  CSE Active Focus
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage curriculum, moderate student uploads, oversee CSE library, and manage upcoming departments.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                navigate('/student');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition"
              title="Preview the student experience"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Switch to Student View</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Direct Admin Upload</span>
            </button>
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Published CSE Resources</span>
            <span className="text-2xl font-extrabold text-[#102C4B] mt-1 block">
              {resources.filter(r => r.publication_status === 'published').length}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Pending Moderation</span>
            <span className={`text-2xl font-extrabold mt-1 block ${pendingSubmissions.length > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
              {pendingSubmissions.length}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">CSE Core Subjects</span>
            <span className="text-2xl font-extrabold text-[#102C4B] mt-1 block">
              {subjects.filter(s => s.department_code === 'CSE').length}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Branches Waitlist (Students)</span>
            <span className="text-2xl font-extrabold text-purple-600 mt-1 block">
              {totalWaitlistedStudents}
            </span>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex items-center gap-2 sm:gap-6 border-b border-slate-200 text-xs sm:text-sm font-semibold overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
              activeTab === 'submissions'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Moderation Queue ({pendingSubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
              activeTab === 'resources'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resource Catalog ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
              activeTab === 'departments'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Department Status & Waitlists</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
              activeTab === 'subjects'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & Subjects ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 -mb-px flex items-center gap-2 transition border-b-2 shrink-0 ${
              activeTab === 'requests'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Student Requests ({requests.length})</span>
          </button>
        </div>

        {/* TAB 1: MODERATION QUEUE */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {pendingSubmissions.length > 0 ? (
              <div className="space-y-3">
                {pendingSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white p-5 rounded-xl border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Moderation
                        </span>
                        <span className="text-xs text-slate-400">
                          Submitted by {sub.user_name} ({sub.user_email}) • {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#102C4B]">
                        {sub.resource.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Course: {sub.resource.subject_code} • {sub.resource.department_code} • Sem {sub.resource.semester} • {sub.resource.file_size_formatted}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {sub.resource.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewResource(sub.resource)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleReviewSubmission(sub.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Publish</span>
                      </button>

                      <button
                        onClick={() => handleReviewSubmission(sub.id, 'rejected')}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#102C4B]">All caught up!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  There are no student submissions pending faculty review right now.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESOURCE CATALOG */}
        {activeTab === 'resources' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Filter by Semester:</span>
                <select
                  value={resourceSemFilter}
                  onChange={(e) => setResourceSemFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="all">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s.toString()}>Sem {s}</option>
                  ))}
                </select>

                <select
                  value={resourceTypeFilter}
                  onChange={(e) => setResourceTypeFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="all">All Types</option>
                  <option value="notes">Lecture Notes</option>
                  <option value="important_questions">Important Questions</option>
                  <option value="question_paper">Question Papers</option>
                  <option value="reference_material">Study Materials</option>
                </select>
              </div>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition"
              >
                + Direct Admin Upload
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Resource Title</th>
                    <th className="px-4 py-3">Subject / Dept</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Downloads</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-[#102C4B]">
                        {res.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">
                        {res.subject_code} • {res.department_code} (Sem {res.semester})
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          res.resource_type === 'question_paper' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {res.resource_type === 'question_paper' ? 'Question Paper' : 'Lecture Notes'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          res.publication_status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {res.publication_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">
                        {res.download_count}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setPreviewResource(res)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(res.id, res.title)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENTS & WAITLISTS */}
        {activeTab === 'departments' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Current Policy: Computer Science & Engineering (CSE) Active Focus</p>
                <p className="mt-0.5 text-purple-800">
                  All other departments (ECE, EEE, MECH, CIVIL, AIDS) are set to "Available Soon" with student waitlist tracking. You can toggle any department's live status below whenever you are ready to roll out new branches.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {departments.map((dept) => {
                const isActive = dept.status === 'active';
                const waitlistCount = waitlistCounts[dept.code] || 0;

                return (
                  <div
                    key={dept.id}
                    className={`bg-white p-5 rounded-xl border flex flex-col justify-between shadow-sm transition ${
                      isActive ? 'border-blue-300 ring-2 ring-blue-50' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {dept.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isActive ? 'Active Catalog' : 'Available Soon'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#102C4B]">{dept.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{dept.description}</p>

                      {!isActive && (
                        <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-600 flex items-center gap-1">
                            <Bell className="w-3.5 h-3.5 text-amber-500" />
                            <span>Student Waitlist:</span>
                          </span>
                          <span className="font-bold text-[#102C4B]">{waitlistCount} students</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleDepartment(dept.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        <span>{isActive ? 'Set to Available Soon' : 'Activate Department'}</span>
                      </button>

                      {!isActive && (
                        <button
                          onClick={() => showToast(`Sent launch interest update to ${waitlistCount} students registered for ${dept.code}!`)}
                          className="text-[11px] font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Simulate Alert</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: CURRICULUM & SUBJECTS */}
        {activeTab === 'subjects' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#102C4B]">Computer Science Curriculum (Anna University R2021)</h3>
                <p className="text-xs text-slate-500">
                  Manage syllabus course codes across all 8 semesters.
                </p>
              </div>
              <button
                onClick={() => setIsSubModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add CSE Subject</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Subject Name</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-4 py-3">Regulation</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">{sub.subject_code}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{sub.name}</td>
                        <td className="px-4 py-3 text-slate-600">{sub.department_code}</td>
                        <td className="px-4 py-3 text-slate-600">Sem {sub.semester}</td>
                        <td className="px-4 py-3 font-mono text-purple-700">{sub.regulation}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/subjects/${sub.id}`}
                            className="text-xs text-blue-600 hover:underline font-semibold"
                          >
                            View Course Hub
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STUDENT REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#102C4B]">Student Resource Requests Board</h3>
              <p className="text-xs text-slate-500">
                Study materials requested by students that can be fulfilled by uploading verified notes or question papers.
              </p>
            </div>

            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {req.status === 'fulfilled' ? 'Fulfilled' : 'Pending Fulfillment'}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({req.votes_count} student votes)
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium">
                      "{req.details}"
                    </p>

                    <div className="text-[11px] text-slate-400">
                      Requested by {req.user_name} ({req.user_email}) • {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status !== 'fulfilled' && (
                      <button
                        onClick={() => handleFulfillRequest(req.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Fulfilled</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-lg transition"
                    >
                      Upload Material
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Add Subject Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#102C4B]">Add Course to CSE Curriculum</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS3601"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={newSubSem}
                    onChange={(e) => setNewSubSem(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s.toString()}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Regulation</label>
                <input
                  type="text"
                  value={newSubReg}
                  onChange={(e) => setNewSubReg(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of syllabus..."
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save to Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PdfViewerModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      <UploadResourceModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          showToast('Material uploaded successfully!');
          loadAdminData();
        }}
      />
    </div>
  );
};
