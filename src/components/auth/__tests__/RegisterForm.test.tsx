import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import RegisterForm from '../RegisterForm';

vi.mock('../../ui/Alert', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>
}));

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{component}</AuthProvider>
    </MemoryRouter>
  );
};

describe('RegisterForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form with all fields', () => {
    renderWithAuth(<RegisterForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithAuth(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.submit(submitButton.closest('form')!);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/please fill in all fields/i);
  });

  it('validates password length', async () => {
    renderWithAuth(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'short' } });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.submit(submitButton.closest('form')!);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/password must be at least 8 characters/i);
  });

  it('toggles between learner and mentor roles', () => {
    renderWithAuth(<RegisterForm />);

    const learnerLabel = screen.getByText(/🎓 Learn/i);
    const mentorLabel = screen.getByText(/👨‍🏫 Mentor/i);

    // Default role is learner
    const learnerRadio = screen.getByLabelText(/🎓 Learn/i) as HTMLInputElement;
    expect(learnerRadio.checked).toBe(true);

    fireEvent.click(mentorLabel);
    const mentorRadio = screen.getByLabelText(/👨‍🏫 Mentor/i) as HTMLInputElement;
    expect(mentorRadio.checked).toBe(true);
  });

  it('has a link to sign in', () => {
    renderWithAuth(<RegisterForm />);
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/login');
  });
});
