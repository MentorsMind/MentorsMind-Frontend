import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import OAuthButtons from './OAuthButtons';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

export default function RegisterForm({ onSuccess, onLogin }: RegisterFormProps) {
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'mentee' as 'mentor' | 'mentee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();
    if (!form.firstName || !form.lastName || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await register(form.firstName, form.lastName, form.email, form.password, form.role);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(form.role === 'mentor' ? '/mentor/onboarding' : '/mentee/onboarding');
      }
    } catch {
      // Error is already set in context, just handle navigation
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">⭐</span>
          <h1 className="text-2xl font-bold text-text mt-2">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join MentorMinds on Stellar</p>
        </div>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}
        {authError && <Alert type="error" className="mb-4">{authError}</Alert>}

        {/* OAuth Buttons */}
        <OAuthButtons mode="register" disabled={loading} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="Jane" required />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Doe" required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {(['mentee', 'mentor'] as const).map(r => (
                <label key={r} className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors
                  ${form.role === r ? 'border-primary bg-accent text-accent-foreground' : 'border-border hover:border-border/80'}`}>
                  <input type="radio" name="role" value={r} checked={form.role === r} onChange={set('role')} className="sr-only" />
                  <span>{r === 'mentee' ? '🎓 Learn' : '👨‍🏫 Mentor'}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
