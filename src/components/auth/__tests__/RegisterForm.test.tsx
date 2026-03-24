import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../../contexts/AuthContext';
import RegisterForm from '../RegisterForm';

const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('RegisterForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form with all fields', () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates name field', async () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must contain uppercase, lowercase, and number/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows password strength indicator', () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} />);

    const passwordInput = screen.getByLabelText(/^password$/i);

    fireEvent.change(passwordInput, { target: { value: 'Weak1' } });
    expect(screen.getByText(/weak/i)).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });

  it('toggles between learner and mentor roles', () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} />);

    const learnerButton = screen.getByRole('button', { name: /learn find mentors/i });
    const mentorButton = screen.getByRole('button', { name: /mentor share knowledge/i });

    expect(learnerButton).toHaveClass('border-stellar');

    fireEvent.click(mentorButton);
    expect(mentorButton).toHaveClass('border-stellar');

    fireEvent.click(learnerButton);
    expect(learnerButton).toHaveClass('border-stellar');
  });

  it('validates terms acceptance', async () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/you must accept the terms and conditions/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onLogin when sign in is clicked', () => {
    renderWithAuth(<RegisterForm onLogin={mockOnLogin} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  it('displays Stellar wallet creation notice', () => {
    renderWithAuth(<RegisterForm onSuccess={mockOnSuccess} />);

    expect(screen.getByText(/stellar wallet creation/i)).toBeInTheDocument();
    expect(screen.getByText(/a stellar blockchain wallet will be automatically created/i)).toBeInTheDocument();
  });
});
