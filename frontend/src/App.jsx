import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import Auth from './components/Auth/Auth';
import LanguageToggle from './components/LanguageToggle';
import ProtectedRoute from './components/ProtectedRoute';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CoursePlayer from './pages/CoursePlayer';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

// ── AdminRoute: JWT-based guard for the superadmin dashboard ─────────────────
function AdminRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin-login" replace />;
}

// ── Only show LanguageToggle on non-admin routes ──────────────────────────────
function ConditionalLanguageToggle() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <LanguageToggle />;
}

function App() {
  return (
    <AuthProvider>
      <TranslationProvider>
        <Router>
          <ConditionalLanguageToggle />
          <Routes>
            {/* Learner auth & app routes */}
            <Route path="/login"      element={<Auth />} />
            <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/courses/:courseId" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />

            {/* Superadmin routes */}
            <Route path="/admin-login"      element={<AdminLogin />} />
            <Route path="/admin-dashboard"  element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Legacy /admin redirect → new protected path */}
            <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </TranslationProvider>
    </AuthProvider>
  );
}

export default App;

