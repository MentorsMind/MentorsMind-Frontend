import React, { useState, FormEvent } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
}

export default function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }

    try {
      await resetPassword(token, formData.password);
      setResetSuccess(true);
    } catch (err) {
      // Error is handled by context
    }
  };

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-blue-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = passwordStrength();

  if (resetSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Password reset successful</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>

        <button
          type="button"
          onClick={onSuccess}
          className="w-full rounded-lg bg-stellar py-3 font-bold text-white shadow-lg shadow-stellar/20 transition-all hover:bg-stellar-dark focus:outline-none focus:ring-2 focus:ring-stellar focus:ring-offset-2"
        >
          Continue to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-2">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, password: e.target.value }));
                if (validationErrors.password) {
                  setValidationErrors(prev => ({ ...prev, password: '' }));
                }
              }}
              className={`w-full rounded-lg border ${
                validationErrors.password ? 'border-red-300' : 'border-gray-300'
              } bg-white py-3 pl-11 pr-12 text-gray-900 placeholder-gray-400 focus:border-stellar focus:outline-none focus:ring-2 focus:ring-stellar/20`}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!validationErrors.password}
              aria-describedby={validationErrors.password ? 'password-error password-strength' : 'password-strength'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formData.password && (
            <div id="password-strength" className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${strength.color}`}
                    style={{ width: `${(strength.strength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">{strength.label}</span>
              </div>
            </div>
          )}
          {validationErrors.password && (
            <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
              {validationErrors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                if (validationErrors.confirmPassword) {
                  setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
                }
              }}
              className={`w-full rounded-lg border ${
                validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              } bg-white py-3 pl-11 pr-12 text-gray-900 placeholder-gray-400 focus:border-stellar focus:outline-none focus:ring-2 focus:ring-stellar/20`}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!validationErrors.confirmPassword}
              aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p id="confirm-password-error" className="mt-2 text-sm text-red-600" role="alert">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-900">Password requirements:</p>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} aria-hidden="true" />
            At least 8 characters
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} aria-hidden="true" />
            One uppercase letter
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} aria-hidden="true" />
            One lowercase letter
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} aria-hidden="true" />
            One number
          </li>
        </ul>
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
            Resetting password...
          </span>
        ) : (
          'Reset password'
        )}
      </button>
    </form>
  );
}
