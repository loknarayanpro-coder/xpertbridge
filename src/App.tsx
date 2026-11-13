import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { DemoBanner } from './components/common/DemoBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { NotesPage } from './pages/NotesPage';
import { QuestionPapersPage } from './pages/QuestionPapersPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { SubjectDetailPage } from './pages/SubjectDetailPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { StudentPortalPage } from './pages/StudentPortalPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { ProtectedRoute } from './components/common/ProtectedRoute';

import { useLocation } from 'react-router-dom';

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Transparent Status & Persona Switcher */}
      <DemoBanner />

      {/* Shared Sticky Header & Navigation (Hidden on Auth Pages) */}
      {!isAuthPage && <Navbar />}

      {/* Main Application Routes */}
      <main className="flex-1">
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
