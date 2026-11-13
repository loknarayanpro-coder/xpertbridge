import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { Subject, ResourceType } from '../../types';
import { HelpCircle, X, CheckCircle2, Send, BookOpen } from 'lucide-react';

interface RequestResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedSubject?: string;
}

export const RequestResourceModal: React.FC<RequestResourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedSubject,
}) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectCode, setSubjectCode] = useState(preselectedSubject || 'CS3591');
  const [resourceType, setResourceType] = useState<ResourceType>('notes');
  const [unitNumber, setUnitNumber] = useState<string>('all');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadSubjects() {
      const all = await dataService.getSubjects('dept-cse');
      setSubjects(all);
      if (preselectedSubject) {
        setSubjectCode(preselectedSubject);
      } else if (all.length > 0) {
        setSubjectCode(all[0].subject_code);
      }
    }
    loadSubjects();
  }, [preselectedSubject]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || !user) return;

    setSubmitting(true);
    const selectedSub = subjects.find(s => s.subject_code === subjectCode);

    await dataService.createResourceRequest({
      user_id: user.id,
      user_name: user.display_name,
      user_email: user.email,
      department_code: 'CSE',
      subject_code: subjectCode,
      subject_name: selectedSub?.name || 'Computer Science Subject',
      semester: selectedSub?.semester || 5,
      resource_type: resourceType,
      unit_number: unitNumber === 'all' ? null : parseInt(unitNumber, 10),
      details: details.trim(),
    });

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose();
      if (onSuccess) onSuccess();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#102C4B]">Request Posted to Academic Board!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Faculty and senior peer contributors have been notified. You will receive an update as soon as the material is uploaded.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#102C4B]">
                  Request Academic Material
                </h3>
                <p className="text-xs text-slate-500">
                  Can't find a specific unit note or question paper? Ask the faculty & peer network.
                </p>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Department: <strong>Computer Science & Engineering (CSE)</strong> — Active Focus
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CSE Subject
                </label>
                <select
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.subject_code}>
                      {sub.subject_code} - {sub.name} (Sem {sub.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Type
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as ResourceType)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="notes">Lecture Notes / Study Material</option>
                  <option value="question_paper">Previous Year Question Paper</option>
                  <option value="reference_material">Lab Manual / Question Bank</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit / Coverage (Optional)
              </label>
              <select
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Entire Subject / Any Unit</option>
                <option value="1">Unit 1</option>
                <option value="2">Unit 2</option>
                <option value="3">Unit 3</option>
                <option value="4">Unit 4</option>
                <option value="5">Unit 5</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Describe What You Need <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Need handwritten solved numericals for Unit 4 DAG optimization and code generation with Anna University question patterns."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !details.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Post Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
