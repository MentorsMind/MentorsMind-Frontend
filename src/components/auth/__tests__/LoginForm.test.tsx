import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../../contexts/AuthContext';
import LoginForm from '../LoginForm';

const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnForgotPassword = vi.fn();
  const mockOnRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all fields', () => {
    renderWithAuth(
      <LoginForm
        onSuccess={mockOnSuccess}
        onForgotPassword={mockOnForgotPassword}
        onRegister={mockOnRegister}
      />
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    renderWithAuth(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    renderWithAuth(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderWithAuth(<LoginForm onSuccess={mockOnSuccess} />);

    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    const toggleButton = screen.getByLabelText(/show password/i);

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('calls onForgotPassword when forgot password is clicked', () => {
    renderWithAuth(<LoginForm onForgotPassword={mockOnForgotPassword} />);

    const forgotPasswordButton = screen.getByText(/forgot password/i);
    fireEvent.click(forgotPasswordButton);

    expect(mockOnForgotPassword).toHaveBeenCalledTimes(1);
  });

  it('calls onRegister when sign up is clicked', () => {
    renderWithAuth(<LoginForm onRegister={mockOnRegister} />);

    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    expect(mockOnRegister).toHaveBeenCalledTimes(1);
  });

  it('submits form with valid credentials', async () => {
    renderWithAuth(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state during submission', async () => {
    renderWithAuth(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('handles remember me checkbox', () => {
    renderWithAuth(<LoginForm onSuccess={mockOnSuccess} />);

    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i }) as HTMLInputElement;

    expect(rememberMeCheckbox.checked).toBe(false);

    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(true);

    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(false);
  });
});
