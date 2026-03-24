import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface EmailVerificationProps {
  token?: string;
  onSuccess?: () => void;
  onSkip?: () => void;
}

export default function EmailVerification({ token, onSuccess, onSkip }: EmailVerificationProps) {
  const { user, verifyEmail, resendVerification, isLoading, error, clearError } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (verificationToken: string) => {
    setVerificationStatus('verifying');
    clearError();

    try {
      await verifyEmail(verificationToken);
      setVerificationStatus('success');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setVerificationStatus('error');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    clearError();
    try {
      await resendVerification();
      setResendCooldown(60);
    } catch (err) {
      // Error is handled by context
    }
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-3">
            <svg className="h-8 w-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verifying your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email verified!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email has been successfully verified. Redirecting you to the dashboard...
          </p>
        </div>

        <div className="flex justify-center">
          <div className="h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-stellar animate-[progress_2s_ease-in-out]" />
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Verification failed</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || 'The verification link is invalid or has expired.'}
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading || resendCooldown > 0}
            className="w-full rounded-lg bg-stellar py-3 font-bold text-white shadow-lg shadow-stellar/20 transition-all hover:bg-stellar-dark focus:outline-none focus:ring-2 focus:ring-stellar focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
          </button>

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-stellar/20"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-blue-100 p-3">
          <Mail className="h-8 w-8 text-blue-600" aria-hidden="true" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a verification email to
        </p>
        <p className="mt-1 font-medium text-gray-900">{user?.email}</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-900">Check your inbox</p>
        <p className="mt-2 text-sm text-blue-800">
          Click the verification link in the email to activate your account. The link will expire in 24 hours.
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-900">Didn't receive the email?</p>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>• Check your spam or junk folder</li>
          <li>• Make sure you entered the correct email</li>
          <li>• Wait a few minutes for the email to arrive</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading || resendCooldown > 0}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-stellar/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            I'll verify later
          </button>
        )}
      </div>

      <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium text-yellow-900">Limited access</p>
            <p className="mt-1 text-yellow-800">
              Some features are restricted until you verify your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
