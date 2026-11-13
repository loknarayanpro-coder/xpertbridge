import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Code-split pages for high-performance loading
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const NotesPage = React.lazy(() => import('./pages/NotesPage').then(m => ({ default: m.NotesPage })));
const QuestionPapersPage = React.lazy(() => import('./pages/QuestionPapersPage').then(m => ({ default: m.QuestionPapersPage })));
const DepartmentsPage = React.lazy(() => import('./pages/DepartmentsPage').then(m => ({ default: m.DepartmentsPage })));
const SubjectDetailPage = React.lazy(() => import('./pages/SubjectDetailPage').then(m => ({ default: m.SubjectDetailPage })));
const ResourceDetailPage = React.lazy(() => import('./pages/ResourceDetailPage').then(m => ({ default: m.ResourceDetailPage })));
const SearchPage = React.lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = React.lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const StudentPortalPage = React.lazy(() => import('./pages/StudentPortalPage').then(m => ({ default: m.StudentPortalPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs text-slate-400 font-medium">Loading view...</span>
  </div>
);

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Shared Sticky Header & Navigation (Hidden on Auth Pages) */}
      {!isAuthPage && <Navbar />}

      {/* Main Application Routes */}
      <main className="flex-1">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Public Discovery & Resource Catalogs (Students can browse without opening) */}
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/question-papers" element={<QuestionPapersPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/subjects/:id" element={<SubjectDetailPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <StudentPortalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <StudentPortalPage />
                </ProtectedRoute>
              }
            />

            {/* Administrator Only Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Shared Deep Navy Footer (Hidden on Auth Pages) */}
      {!isAuthPage && <Footer />}

      {/* Global Toast Feedback */}
      <Toast />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookmarkProvider>
          <AppLayout />
        </BookmarkProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
