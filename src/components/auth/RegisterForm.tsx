import React, { useState, FormEvent } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

export default function RegisterForm({
  onSuccess,
  onLogin,
}: RegisterFormProps) {
  const { register, isLoading, error, clearError, fieldErrors } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "learner" as "learner" | "mentor",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      errors.terms = "You must accept the terms and conditions";
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
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
      );
      onSuccess?.();
    } catch (err) {
      // Error is handled by context
    }
  };

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3)
      return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const strength = passwordStrength();

  // Merge backend field errors with client validation errors
  const emailError = validationErrors.email || fieldErrors?.email;
  const passwordError = validationErrors.password || fieldErrors?.password;
  const nameError = validationErrors.name || fieldErrors?.name;
  const termsError = validationErrors.terms || fieldErrors?.terms;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join MentorMinds and start your learning journey
        </p>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Full name
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="register-name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (nameError) {
                  setValidationErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              className={`w-full rounded-lg border ${
                nameError ? "border-red-300" : "border-gray-300"
              } bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-stellar focus:outline-none focus:ring-2 focus:ring-stellar/20`}
              placeholder="John Doe"
              autoComplete="name"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : undefined}
              disabled={isLoading}
            />
          </div>
          {nameError && (
            <p
              id="name-error"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="register-email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (emailError) {
                  setValidationErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              className={`w-full rounded-lg border ${
                emailError ? "border-red-300" : "border-gray-300"
              } bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-stellar focus:outline-none focus:ring-2 focus:ring-stellar/20`}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              disabled={isLoading}
            />
          </div>
          {emailError && (
            <p
              id="email-error"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "learner" }))
              }
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                formData.role === "learner"
                  ? "border-stellar bg-stellar/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              disabled={isLoading}
            >
              <div className="font-medium text-gray-900">Learn</div>
              <div className="mt-1 text-sm text-gray-600">Find mentors</div>
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "mentor" }))
              }
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                formData.role === "mentor"
                  ? "border-stellar bg-stellar/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              disabled={isLoading}
            >
              <div className="font-medium text-gray-900">Mentor</div>
              <div className="mt-1 text-sm text-gray-600">Share knowledge</div>
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                if (passwordError) {
                  setValidationErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              className={`w-full rounded-lg border ${
                passwordError ? "border-red-300" : "border-gray-300"
              } bg-white py-3 pl-11 pr-12 text-gray-900 placeholder-gray-400 focus:border-stellar focus:outline-none focus:ring-2 focus:ring-stellar/20`}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!passwordError}
              aria-describedby={
                passwordError
                  ? "password-error password-strength"
                  : "password-strength"
              }
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
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
                <span className="text-xs font-medium text-gray-600">
                  {strength.label}
                </span>
              </div>
            </div>
          )}
          {passwordError && (
            <p
              id="password-error"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {passwordError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }));
                if (validationErrors.confirmPassword) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    confirmPassword: "",
                  }));
                }
              }}
              className={`w-full rounded-lg border ${
                validationErrors.confirmPassword
                  ? "border-red-300"
                  : "border-gray-300"
              } bg-white py-3 pl-11 pr-12 text-gray-900 placeholder-gray-400 focus:border-stellar focus:outline-none focus:ring-2 focus:ring-stellar/20`}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!validationErrors.confirmPassword}
              aria-describedby={
                validationErrors.confirmPassword
                  ? "confirm-password-error"
                  : undefined
              }
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p
              id="confirm-password-error"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-stellar/20 bg-stellar/5 p-4">
          <div className="flex items-start gap-3">
            <Wallet
              className="h-5 w-5 text-stellar flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                Stellar Wallet Creation
              </p>
              <p className="mt-1 text-gray-600">
                A Stellar blockchain wallet will be automatically created for
                you to manage payments securely.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => {
              setAcceptTerms(e.target.checked);
              if (termsError) {
                setValidationErrors((prev) => ({ ...prev, terms: "" }));
              }
            }}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-stellar focus:ring-2 focus:ring-stellar/20"
            aria-invalid={!!termsError}
            aria-describedby={termsError ? "terms-error" : undefined}
            disabled={isLoading}
          />
          <span className="text-sm text-gray-700">
            I agree to the{" "}
            <a
              href="#"
              className="font-medium text-stellar hover:text-stellar-dark"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-medium text-stellar hover:text-stellar-dark"
            >
              Privacy Policy
            </a>
          </span>
        </label>
        {termsError && (
          <p
            id="terms-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {termsError}
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
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating account...
          </span>
        ) : (
          "Create account"
        )}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onLogin}
          className="font-medium text-stellar hover:text-stellar-dark"
          disabled={isLoading}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
