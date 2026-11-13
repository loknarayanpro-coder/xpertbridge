import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { 
  BookOpen, 
  ShieldCheck, 
  Users, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const faqs = [
    {
      q: 'What is XpertBridge?',
      a: 'XpertBridge is a student-focused collegiate academic platform that allows engineering and university students to discover, preview, download, and share verified unit-wise lecture notes and previous-year university question papers.'
    },
    {
      q: 'Do I need an account to browse and download notes?',
      a: 'No. All approved lecture notes and examination papers are freely accessible for reading and downloading without mandatory registration. Creating an account allows you to save bookmarks across sessions and submit your own materials.'
    },
    {
      q: 'How are student submissions reviewed?',
      a: 'All student contributions enter an administrative moderation queue before publication. Authorized department faculty and academic administrators verify that the notes match current regulation syllabi and maintain high readability standards before making them public.'
    },
    {
      q: 'Which university regulations are supported?',
      a: 'The platform currently organizes materials according to R2021 and R2017 curricula, with support for autonomous college syllabus structures.'
    },
    {
      q: 'Can I request question papers or notes for a missing subject?',
      a: 'Yes. You can use our Contact & Feedback page to request missing subject codes or report syllabus updates to our administration.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Brand Mission Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-block">
            <Logo size="lg" showTagline={true} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102C4B] tracking-tight">
            Learn. Connect. Grow.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Our primary mission is to make academic resources easy to find, access, and share for every college student.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#102C4B]">Academically Focused</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organized systematically by department, semester, and unit. No clickbait or distracting widgets—only the exact curriculum materials you need.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#102C4B]">Moderated & Verified</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every document is reviewed for authenticity, curriculum accuracy, and legibility before being published to the student catalog.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#102C4B]">Peer Collaboration</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Built by students, for students. We empower peers to upload helpful summaries, formula sheets, and past internal exam solutions.
            </p>
          </div>
        </div>

        {/* Academic Integrity & Guidelines */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-[#102C4B]">
            Academic Integrity & Fair Use Policy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            XpertBridge provides study notes and previous-year question papers solely for educational, reference, and exam preparation purposes. All uploaded materials remain the intellectual property of their respective student or faculty authors. Question papers are archived for academic preparation under educational fair use.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-700">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Strictly Non-Commercial
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Attribution Respected
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Moderated Submissions
            </span>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="space-y-6 pt-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-[#102C4B]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-[#102C4B]">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition"
          >
            <span>Explore the Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
