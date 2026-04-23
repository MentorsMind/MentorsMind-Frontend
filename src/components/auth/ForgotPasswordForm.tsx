import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

export default function ForgotPasswordForm({ onBack }: { onBack?: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  if (sent) return (
    <div className="text-center space-y-4">
      <div className="text-5xl">📧</div>
      <h3 className="text-lg font-semibold text-text">Check your email</h3>
      <p className="text-sm text-muted-foreground">We sent a reset link to <strong>{email}</strong></p>
      <Button variant="outline" onClick={onBack} className="w-full">Back to login</Button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text">Reset password</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a reset link.</p>
      </div>
      <Alert type="info">Password reset links expire after 1 hour.</Alert>
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
      <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
      {onBack && <button type="button" onClick={onBack} className="w-full text-sm text-muted-foreground hover:text-text">← Back to login</button>}
    </form>
  );
}
