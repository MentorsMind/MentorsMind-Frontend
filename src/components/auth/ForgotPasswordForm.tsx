import React, { useState, FormEvent } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateEmail = () => {
    if (!email) {
      setValidationError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateEmail()) {
      return;
    }

    try {
      await forgotPassword(email);
      setEmailSent(true);
    } catch (err) {
      // Error is handled by context
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent password reset instructions to
          </p>
          <p className="mt-1 font-medium text-gray-900">{email}</p>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 text-left">
          <p className="text-sm text-blue-900">
            <strong>Didn't receive the email?</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email</li>
            <li>• Wait a few minutes and try again</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-stellar/20"
          >
            Try another email
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-lg bg-stellar py-3 font-bold text-white shadow-lg shadow-stellar/20 transition-all hover:bg-stellar-dark focus:outline-none focus:ring-2 focus:ring-stellar focus:ring-offset-2"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </button>

        <h2 className="text-2xl font-bold text-gray-900">Forgot password?</h2>
        <p className="mt-2 text-sm text-gray-600">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) {
                setValidationError('');
              }
            }}
            className={`w-full rounded-lg border ${
              validationError ? 'border-red-300' : 'border-gray-300'
            } bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-stellar focus:outline-none focus:ring-2 focus:ring-stellar/20`}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'email-error' : undefined}
            disabled={isLoading}
          />
        </div>
        {validationError && (
          <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
            {validationError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-stellar py-3 font-bold text-white shadow-lg shadow-stellar/20 transition-all hover:bg-stellar-dark focus:outline-none focus:ring-2 focus:ring-stellar focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </span>
        ) : (
          'Send reset instructions'
        )}
      </button>
    </form>
  );
}
