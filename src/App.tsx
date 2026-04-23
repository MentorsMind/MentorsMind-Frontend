import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
import CheckoutPage from './pages/CheckoutPage';
import LearningGoals from './pages/LearningGoals';
import OAuthCallback from './components/auth/OAuthCallback';

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
            {/* OAuth callback */}
            <Route path="/auth/callback" element={<OAuthCallback />} />
            {/* MFA challenge — semi-public: requires mfaPending state in AuthContext */}
            <Route path="/auth/mfa-challenge" element={<MFAChallengeScreen />} />

            {/* Mentor routes */}
            <Route path="/mentor" element={<ProtectedRoute><DashboardLayout><Navigate to="/mentor/dashboard" replace /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/dashboard" element={<ProtectedRoute><DashboardLayout><MentorDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/profile" element={<ProtectedRoute><DashboardLayout><MentorProfile /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/wallet" element={<ProtectedRoute><DashboardLayout><MentorWallet /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/sessions" element={<ProtectedRoute><DashboardLayout><SessionHistory /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mentor/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />

            {/* Learner routes */}
            <Route path="/learner" element={<ProtectedRoute><DashboardLayout><Navigate to="/learner/dashboard" replace /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/dashboard" element={<ProtectedRoute><DashboardLayout><LearnerDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/goals" element={<ProtectedRoute><DashboardLayout><LearningGoals /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/profile" element={<ProtectedRoute><DashboardLayout><LearnerProfile /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/sessions" element={<ProtectedRoute><DashboardLayout><SessionHistory /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/payments" element={<ProtectedRoute><DashboardLayout><PaymentHistory /></DashboardLayout></ProtectedRoute>} />
            <Route path="/learner/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />

            {/* Checkout */}
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
