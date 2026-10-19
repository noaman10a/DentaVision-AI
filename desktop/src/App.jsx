import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { AIProvider } from './context/AIContext';

import { AppLayout } from './components/layout/AppLayout';
import { ProtectedLayout } from './components/layout/ProtectedLayout';

import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Reception Pages
import { ReceptionDashboard } from './pages/reception/ReceptionDashboard';
import { PatientSearchPage } from './pages/reception/PatientSearchPage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientWorkspace } from './pages/doctor/PatientWorkspace';
import { ClinicalVisitScreen } from './pages/doctor/ClinicalVisitScreen';
import { PrescriptionModule } from './pages/doctor/PrescriptionModule';
import { ReportModule } from './pages/doctor/ReportModule';
import { DocumentsModule } from './pages/doctor/DocumentsModule';
import { TimelineModule } from './pages/doctor/TimelineModule';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { HealthCheckScreen } from './pages/admin/HealthCheckScreen';

const DefaultRoleRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'reception') return <Navigate to="/reception" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/doctor" replace />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PatientProvider>
          <AIProvider>
            <HashRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Protected Workstation Shell */}
                <Route element={<ProtectedLayout />}>
                  <Route element={<AppLayout />}>
                    {/* Dynamic role-based landing */}
                    <Route path="/" element={<DefaultRoleRedirect />} />

                    {/* Reception Routes */}
                    <Route path="/reception" element={<ReceptionDashboard />} />
                    <Route path="/reception/search" element={<PatientSearchPage />} />

                    {/* Doctor Routes */}
                    <Route path="/doctor" element={<DoctorDashboard />} />
                    <Route path="/workspace" element={<PatientWorkspace />} />
                    <Route path="/doctor/clinical-visit" element={<ClinicalVisitScreen />} />
                    <Route path="/doctor/prescriptions" element={<PrescriptionModule />} />
                    <Route path="/doctor/reports" element={<ReportModule />} />
                    <Route path="/doctor/documents" element={<DocumentsModule />} />
                    <Route path="/doctor/timeline" element={<TimelineModule />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/health" element={<HealthCheckScreen />} />
                  </Route>
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </HashRouter>
          </AIProvider>
        </PatientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
