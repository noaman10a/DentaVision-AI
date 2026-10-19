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
import { PatientRegistrationPage } from './pages/reception/PatientRegistrationPage';
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

// User Profile Page
import { ProfilePage } from './pages/profile/ProfilePage';

const DefaultRoleRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'reception') return <Navigate to="/reception" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/doctor" replace />;
};

// Route guard restricting clinical diagnostic workspace to Doctors and Admins
const ClinicalDoctorRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'reception') {
    return <Navigate to="/reception" replace />;
  }
  return children;
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

                    {/* Workstation User Profile Route */}
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Reception Routes */}
                    <Route path="/reception" element={<ReceptionDashboard />} />
                    <Route path="/reception/register" element={<PatientRegistrationPage />} />
                    <Route path="/reception/search" element={<PatientSearchPage />} />

                    {/* Doctor Clinical Routes */}
                    <Route path="/doctor" element={<DoctorDashboard />} />
                    <Route 
                      path="/workspace" 
                      element={
                        <ClinicalDoctorRoute>
                          <PatientWorkspace />
                        </ClinicalDoctorRoute>
                      } 
                    />
                    <Route path="/doctor/clinical-visit" element={<ClinicalDoctorRoute><ClinicalVisitScreen /></ClinicalDoctorRoute>} />
                    <Route path="/doctor/prescriptions" element={<ClinicalDoctorRoute><PrescriptionModule /></ClinicalDoctorRoute>} />
                    <Route path="/doctor/reports" element={<ClinicalDoctorRoute><ReportModule /></ClinicalDoctorRoute>} />
                    <Route path="/doctor/documents" element={<ClinicalDoctorRoute><DocumentsModule /></ClinicalDoctorRoute>} />
                    <Route path="/doctor/timeline" element={<ClinicalDoctorRoute><TimelineModule /></ClinicalDoctorRoute>} />

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
