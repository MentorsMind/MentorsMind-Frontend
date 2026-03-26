import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import EmailVerification from './EmailVerification';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  resetToken?: string;
  verificationToken?: string;
  onAuthSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialView = 'login',
  resetToken,
  verificationToken,
  onAuthSuccess,
}: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (resetToken) {
      setCurrentView('reset-password');
    } else if (verificationToken) {
      setCurrentView('verify-email');
    } else {
      setCurrentView(initialView);
    }
  }, [initialView, resetToken, verificationToken]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSuccess = () => {
    onAuthSuccess?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-stellar/20"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="p-8">
          {currentView === 'login' && (
            <LoginForm
              onSuccess={handleSuccess}
              onForgotPassword={() => setCurrentView('forgot-password')}
              onRegister={() => setCurrentView('register')}
            />
          )}

          {currentView === 'register' && (
            <RegisterForm
              onSuccess={() => setCurrentView('verify-email')}
              onLogin={() => setCurrentView('login')}
            />
          )}

          {currentView === 'forgot-password' && (
            <ForgotPasswordForm onBack={() => setCurrentView('login')} />
          )}

          {currentView === 'reset-password' && resetToken && (
            <ResetPasswordForm
              token={resetToken}
              onSuccess={() => setCurrentView('login')}
            />
          )}

          {currentView === 'verify-email' && (
            <EmailVerification
              token={verificationToken}
              onSuccess={handleSuccess}
              onSkip={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}
