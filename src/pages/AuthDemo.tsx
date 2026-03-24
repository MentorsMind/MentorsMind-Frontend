import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Key, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/auth/AuthModal';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';

export default function AuthDemo() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initialView, setInitialView] = useState<AuthView>('login');

  const openAuthModal = (view: AuthView) => {
    setInitialView(view);
    setShowAuthModal(true);
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stellar/10 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-12 w-12 text-green-600" aria-hidden="true" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-center text-gray-600 mb-8">
              You are successfully authenticated
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium text-gray-900 capitalize">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-medium text-gray-900 text-xs">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Status</p>
                    <p className={`font-medium ${user.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {user.stellarPublicKey && (
                <div className="bg-stellar/5 border border-stellar/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Stellar Wallet</p>
                  <p className="font-mono text-sm text-stellar break-all">{user.stellarPublicKey}</p>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="w-full rounded-lg bg-gray-900 py-3 font-bold text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stellar/10 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stellar font-bold text-white text-2xl shadow-lg shadow-stellar/30">
              M
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            MentorMinds <span className="text-stellar">Authentication</span>
          </h1>
          <p className="text-lg text-gray-600">
            Complete authentication system with Stellar wallet integration
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => openAuthModal('login')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 text-left border-2 border-transparent hover:border-stellar/20"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-stellar/10 p-3 group-hover:bg-stellar/20 transition-colors">
                <LogIn className="h-6 w-6 text-stellar" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Access your account with email and password
                </p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li>• Email/password validation</li>
                  <li>• Remember me option</li>
                  <li>• Social login ready</li>
                </ul>
              </div>
            </div>
          </button>

          <button
            onClick={() => openAuthModal('register')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 text-left border-2 border-transparent hover:border-stellar/20"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-100 p-3 group-hover:bg-blue-200 transition-colors">
                <UserPlus className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Account</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Register with automatic Stellar wallet creation
                </p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li>• Password strength indicator</li>
                  <li>• Role selection</li>
                  <li>• Stellar wallet setup</li>
                </ul>
              </div>
            </div>
          </button>

          <button
            onClick={() => openAuthModal('forgot-password')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 text-left border-2 border-transparent hover:border-stellar/20"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-yellow-100 p-3 group-hover:bg-yellow-200 transition-colors">
                <Mail className="h-6 w-6 text-yellow-600" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Forgot Password</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Request password reset instructions via email
                </p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li>• Email validation</li>
                  <li>• Resend capability</li>
                  <li>• Clear instructions</li>
                </ul>
              </div>
            </div>
          </button>

          <button
            onClick={() => openAuthModal('reset-password')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 text-left border-2 border-transparent hover:border-stellar/20"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-green-100 p-3 group-hover:bg-green-200 transition-colors">
                <Key className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Set a new password with strength validation
                </p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li>• Password requirements</li>
                  <li>• Strength indicator</li>
                  <li>• Confirmation check</li>
                </ul>
              </div>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Validation</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Email format checking</li>
                <li>• Password strength</li>
                <li>• Real-time feedback</li>
                <li>• Error messages</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Security</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Token-based reset</li>
                <li>• Email verification</li>
                <li>• Session management</li>
                <li>• Secure storage</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">UX</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Loading states</li>
                <li>• Error handling</li>
                <li>• Accessibility</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView={initialView}
        resetToken={initialView === 'reset-password' ? 'demo-token' : undefined}
        onAuthSuccess={() => {
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}
