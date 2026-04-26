import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/navigation/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import SkipNavigation from './components/a11y/SkipNavigation';
import LoadingAnimation from './components/animations/LoadingAnimation';
import OAuthCallback from './components/auth/OAuthCallback';
import AuthErrorPage from './pages/AuthErrorPage';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const MentorSearch = lazy(() => import('./pages/MentorSearch'));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));
const MentorProfile = lazy(() => import('./pages/MentorProfile'));
const MentorWallet = lazy(() => import('./pages/MentorWallet'));
const MentorOnboarding = lazy(() => import('./pages/MentorOnboarding'));
const LearnerDashboard = lazy(() => import('./pages/LearnerDashboard'));
const LearnerProfile = lazy(() => import('./pages/LearnerProfile'));
const LearnerOnboarding = lazy(() => import('./pages/LearnerOnboarding'));
const SessionHistory = lazy(() => import('./pages/SessionHistory'));
const PaymentHistory = lazy(() => import('./pages/PaymentHistory'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LearningGoals = lazy(() => import('./pages/LearningGoals'));
const Settings = lazy(() => import('./pages/Settings'));
const MFAChallengeScreen = lazy(() => import('./pages/MFAChallengeScreen'));
const Messages = lazy(() => import('./pages/Messages'));
const DisputeDetailPage = lazy(() => import('./pages/DisputeDetailPage'));
const AdminAnalytics = lazy(() => import('./components/admin/AdminAnalytics'));
const AdminUsers = lazy(() => import('./components/admin/AdminUsers'));
const AdminTransactions = lazy(() => import('./components/admin/AdminTransactions'));
const AdminSessions = lazy(() => import('./components/admin/AdminSessions'));
const AdminPayments = lazy(() => import('./components/admin/AdminPayments'));
const AdminDisputes = lazy(() => import('./components/admin/AdminDisputes'));
const AdminLogs = lazy(() => import('./components/admin/AdminLogs'));
const EmailTemplatePreview = lazy(() => import('./components/admin/EmailTemplatePreview'));


// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingAnimation size="lg" />
  </div>
);

import { RoleBasedRoute } from './components/navigation/RoleBasedRoute';
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
  const auth = useAuth();
  return (
    <BrowserRouter>
      <SkipNavigation />
      <main id="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/mentors" element={<MentorSearch />} />
            <Route path="/onboarding/mentor" element={<MentorOnboarding />} />
            <Route path="/onboarding/learner" element={<LearnerOnboarding />} />
            {/* OAuth callback */}
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/auth/error" element={<AuthErrorPage />} />
            {/* MFA challenge — semi-public: requires mfaPending state in AuthContext */}
            <Route path="/auth/mfa-challenge" element={<MFAChallengeScreen />} />

            {/* Mentor routes */}
            <Route path="/mentor" element={<ProtectedRoute><DashboardLayout><Navigate to="/mentor/dashboard" replace /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/dashboard" element={<ProtectedRoute><DashboardLayout><MentorDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/profile" element={<ProtectedRoute><DashboardLayout><MentorProfile /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/wallet" element={<ProtectedRoute><DashboardLayout><MentorWallet /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/sessions" element={<ProtectedRoute><DashboardLayout><SessionHistory /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><DashboardLayout><Messages /></DashboardLayout></ProtectedRoute>} />
            <Route path="/disputes/:id" element={<ProtectedRoute><DashboardLayout><DisputeDetailPage /></DashboardLayout></ProtectedRoute>} />

            {/* Learner routes */}
            <Route path="/learner" element={<ProtectedRoute><DashboardLayout><Navigate to="/learner/dashboard" replace /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/dashboard" element={<ProtectedRoute><DashboardLayout><LearnerDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/goals" element={<ProtectedRoute><DashboardLayout><LearningGoals /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/profile" element={<ProtectedRoute><DashboardLayout><LearnerProfile /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/sessions" element={<ProtectedRoute><DashboardLayout><SessionHistory /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/payments" element={<ProtectedRoute><DashboardLayout><PaymentHistory /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />

                {/* Checkout */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />

            {/* Admin routes */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute auth={auth} allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminAnalytics />
                    </DashboardLayout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute auth={auth} allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminUsers />
                    </DashboardLayout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute auth={auth} allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminTransactions />
                    </DashboardLayout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sessions"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute auth={auth} allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminSessions />
                    </DashboardLayout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute auth={auth} allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminPayments />
                    </DashboardLayout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/disputes"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute auth={auth} allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminDisputes />
                    </DashboardLayout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute auth={auth} allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminLogs />
                    </DashboardLayout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/email-preview/:template"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute auth={auth} allowedRoles={['admin']}>
                    <DashboardLayout>
                      <EmailTemplatePreview />
                    </DashboardLayout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            {/* Settings Redirect */}
            <Route path="/settings" element={<ProtectedRoute><Navigate to={auth.user?.role === 'mentor' ? '/mentor/settings' : '/learner/settings'} replace /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}
