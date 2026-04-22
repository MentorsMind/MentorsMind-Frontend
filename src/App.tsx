import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/navigation/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import SkipNavigation from './components/a11y/SkipNavigation';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
import MentorSearch from './pages/MentorSearch';
import MentorDashboard from './pages/MentorDashboard';
import MentorProfile from './pages/MentorProfile';
import MentorWallet from './pages/MentorWallet';
import MentorOnboarding from './pages/MentorOnboarding';
import LearnerDashboard from './pages/LearnerDashboard';
import LearnerProfile from './pages/LearnerProfile';
import LearnerOnboarding from './pages/LearnerOnboarding';
import SessionHistory from './pages/SessionHistory';
import PaymentHistory from './pages/PaymentHistory';
import MentorAvailability from './pages/MentorAvailability';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SkipNavigation />
        <main id="main-content">
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/mentors" element={<MentorSearch />} />
            <Route path="/onboarding/mentor" element={<MentorOnboarding />} />
            <Route path="/onboarding/learner" element={<LearnerOnboarding />} />

            {/* Mentor routes */}
            <Route path="/mentor" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><Navigate to="/mentor/dashboard" replace /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />
            <Route path="/mentor/dashboard" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><MentorDashboard /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />
            <Route path="/mentor/profile" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><MentorProfile /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />
            <Route path="/mentor/wallet" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><MentorWallet /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />
            <Route path="/mentor/sessions" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><SessionHistory /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />
            <Route path="/mentor/availability" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><MentorAvailability /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />

            {/* Learner routes */}
            <Route path="/learner" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><Navigate to="/learner/dashboard" replace /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />
            <Route path="/learner/dashboard" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><LearnerDashboard /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />
            <Route path="/learner/profile" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><LearnerProfile /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />
            <Route path="/learner/sessions" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><SessionHistory /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />
            <Route path="/learner/payments" element={<ProtectedRoute><ErrorBoundary><DashboardLayout><PaymentHistory /></DashboardLayout></ErrorBoundary></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
