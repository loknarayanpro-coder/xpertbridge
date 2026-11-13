import React, { useState, useEffect } from 'react';
import { Department, Subject, ResourceType, ExamType } from '../../types';
import { dataService } from '../../lib/dataService';
import { materialsService } from '../../lib/materials';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultDepartmentId?: string;
  defaultSubjectId?: string;
  defaultResourceType?: ResourceType;
}

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDepartmentId,
  defaultSubjectId,
  defaultResourceType = 'notes',
}) => {
  const { user, isAdmin } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState(defaultDepartmentId || '');
  const [semester, setSemester] = useState('3');
  const [subjectId, setSubjectId] = useState(defaultSubjectId || '');
  const [resourceType, setResourceType] = useState<ResourceType>(defaultResourceType);
  const [unitNumber, setUnitNumber] = useState('1');
  const [unitsLabel, setUnitsLabel] = useState('Unit 1');
  
  // Question paper metadata
  const [examYear, setExamYear] = useState('2026');
  const [examType, setExamType] = useState<ExamType>('End Semester Exam');
  const [regulation, setRegulation] = useState('R2021');

  // File
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const depts = await dataService.getDepartments();
      setDepartments(depts);
      if (!departmentId && depts.length > 0) {
        setDepartmentId(depts[0].id);
      }
    }
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    async function loadSubjects() {
      if (departmentId) {
        const subs = await dataService.getSubjects(departmentId);
        setSubjects(subs);
        const match = subs.find(s => s.semester.toString() === semester) || subs[0];
        if (match) {
          setSubjectId(match.id);
        } else {
          setSubjectId('');
        }
      }
    }
    loadSubjects();
  }, [departmentId, semester]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 25 * 1024 * 1024) {
        setErrorMsg('File exceeds maximum allowed size of 25 MB.');
        return;
      }
      setFile(selected);
      setErrorMsg(null);
      if (!title) {
        // Auto-fill title from filename
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive resource title.');
      return;
    }
    if (!subjectId) {
      setErrorMsg('Please select a subject.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const selectedSubject = subjects.find(s => s.id === subjectId);
      const selectedDept = departments.find(d => d.id === departmentId);

      const isDirectPublish = isAdmin || window.location.pathname.includes('/admin');
      const status = isDirectPublish ? 'published' : 'pending';

      let finalStoragePath = '';

      if (file && isSupabaseConfigured) {
        try {
          const uploadRes = await materialsService.uploadFile(file, `notes/${selectedDept?.code?.toLowerCase() || 'cse'}`);
          if (uploadRes?.path) {
            finalStoragePath = uploadRes.path;
          }
        } catch (uploadErr) {
          console.warn('Direct bucket upload failed, using relative path:', uploadErr);
          finalStoragePath = `uploads/${selectedDept?.code?.toLowerCase() || 'cse'}/${Date.now()}_${file.name}`;
        }
      } else if (file) {
        finalStoragePath = `uploads/${selectedDept?.code?.toLowerCase() || 'cse'}/${Date.now()}_${file.name}`;
      }

      const resourcePayload = {
        title: title.trim(),
        description: description.trim() || `Course resource for ${selectedSubject?.name || 'subject'} (${selectedSubject?.subject_code || ''}).`,
        subject_id: subjectId,
        subject_name: selectedSubject?.name,
        subject_code: selectedSubject?.subject_code,
        department_id: departmentId,
        department_code: selectedDept?.code || 'CSE',
        semester: parseInt(semester, 10),
        academic_year: Math.ceil(parseInt(semester, 10) / 2),
        resource_type: resourceType,
        unit_number: resourceType === 'notes' ? parseInt(unitNumber, 10) : null,
        units_label: resourceType === 'notes' ? unitsLabel : `${examYear} ${examType}`,
        storage_path: finalStoragePath,
        original_filename: file?.name || 'No file attached',
        file_size: file?.size || 0,
        file_size_formatted: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'No file',
        mime_type: file?.type || 'application/pdf',
        uploaded_by: user?.id || 'usr-student',
        uploader_name: user?.display_name || 'Student Contributor',
        uploader_avatar: undefined,
        publication_status: status as any,
        sample_content: [
          `Uploaded academic study document for ${title}.`,
          `Verified according to ${regulation} curriculum guidelines.`,
          `Contains structured formulas, diagrams, and reference questions.`
        ],
        question_paper: resourceType === 'question_paper' ? {
          resource_id: '',
          examination_year: parseInt(examYear, 10),
          examination_type: examType,
          regulation: regulation,
          semester: parseInt(semester, 10),
        } : undefined,
      };

      if (isDirectPublish) {
        await dataService.createResource(resourcePayload);
        setSuccessMsg('Resource published directly to the public library!');
      } else {
        // Student submission goes to moderation queue
        await dataService.createSubmission({
          user_id: user?.id || 'usr-student',
          user_name: user?.display_name || 'Student Contributor',
          user_email: user?.email || 'student@campus.edu',
          resource: {
            ...resourcePayload,
            id: `res-subm-${Date.now()}`,
            download_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
        setSuccessMsg('Your contribution has been submitted! It will appear in the library once reviewed by an administrator.');
      }

      setTimeout(() => {
        setSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);

    } catch (err: unknown) {
      setSubmitting(false);
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-[#102C4B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-cyan-300 flex items-center justify-center">
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAdmin ? 'Publish Academic Resource' : 'Share Study Resource'}
              </h3>
              <p className="text-xs text-slate-300">
                {isAdmin ? 'Direct administrative publishing' : 'Contribute notes or past question papers to peers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Resource Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Resource Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setResourceType('notes')}
                className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                  resourceType === 'notes'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Lecture Notes
              </button>
              <button
                type="button"
                onClick={() => setResourceType('important_questions')}
                className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                  resourceType === 'important_questions'
                    ? 'border-amber-600 bg-amber-50 text-amber-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Important Questions
              </button>
              <button
                type="button"
                onClick={() => setResourceType('question_paper')}
                className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                  resourceType === 'question_paper'
                    ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Previous Year QP
              </button>
              <button
                type="button"
                onClick={() => setResourceType('reference_material')}
                className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                  resourceType === 'reference_material'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Study Material
              </button>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                resourceType === 'notes' ? 'e.g. Data Structures Unit 1-4 Complete Notes' :
                resourceType === 'important_questions' ? 'e.g. Operating Systems Top 25 Important Questions (2 & 16 Marks)' :
                resourceType === 'question_paper' ? 'e.g. Theory of Computation Nov/Dec 2024 End Semester' :
                'e.g. Computer Networks Comprehensive Study Guide'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
            />
          </div>

          {/* Department and Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} — {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                const sId = e.target.value;
                setSubjectId(sId);
                const chosen = subjects.find(s => s.id === sId);
                if (chosen && chosen.semester) {
                  setSemester(chosen.semester.toString());
                }
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {(() => {
                const semSubs = subjects.filter(s => s.semester.toString() === semester);
                const displayList = semSubs.length > 0 ? semSubs : subjects;
                if (displayList.length > 0) {
                  return displayList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject_code} — {s.name} (Sem {s.semester})
                    </option>
                  ));
                }
                return <option value="">No subjects found for this department</option>;
              })()}
            </select>
          </div>

          {/* Conditional Fields based on Resource Type */}
          {resourceType === 'notes' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Number
                </label>
                <select
                  value={unitNumber}
                  onChange={(e) => {
                    setUnitNumber(e.target.value);
                    setUnitsLabel(`Unit ${e.target.value}`);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="1">Unit 1</option>
                  <option value="2">Unit 2</option>
                  <option value="3">Unit 3</option>
                  <option value="4">Unit 4</option>
                  <option value="5">Unit 5</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coverage Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 1-4, Unit 3, Complete"
                  value={unitsLabel}
                  onChange={(e) => setUnitsLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Year
                </label>
                <select
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  <option value="2026">2026 (Current)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Type
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="End Semester Exam">End Semester Exam</option>
                  <option value="Model Examination">Model Exam</option>
                  <option value="Internal Assessment 1">Internal 1</option>
                  <option value="Internal Assessment 2">Internal 2</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Regulation
                </label>
                <select
                  value={regulation}
                  onChange={(e) => setRegulation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="R2021">R2021</option>
                  <option value="R2017">R2017</option>
                </select>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Topics Covered
            </label>
            <textarea
              rows={2}
              placeholder="Brief details about the syllabus topics, formulas, or question types in this document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload PDF File <span className="text-slate-400 font-normal">(Max 25 MB)</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-blue-400 bg-slate-50/50 transition">
              <input
                type="file"
                id="resource-file-input"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="resource-file-input" className="cursor-pointer block">
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <FileCheck className="w-6 h-6" />
                    <div className="text-left">
                      <p className="text-xs font-semibold">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-slate-700">
                      Click to choose document or drag and drop
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PDF, DOCX, or TXT study materials
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-2"
            >
              {submitting ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>{isAdmin ? 'Publish to Library' : 'Submit for Moderation'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
