import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../../../contexts/AuthContext';
import AuthModal from '../AuthModal';

const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('AuthModal', () => {
  const mockOnClose = vi.fn();
  const mockOnAuthSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    renderWithAuth(
      <AuthModal isOpen={false} onClose={mockOnClose} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders login form by default', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('renders register form when initialView is register', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} initialView="register" />
    );

    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    const closeButton = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal when backdrop is clicked', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('closes modal when Escape key is pressed', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside modal content', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    const modalContent = screen.getByRole('dialog');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('switches to forgot password view', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    const forgotPasswordButton = screen.getByText(/forgot password/i);
    fireEvent.click(forgotPasswordButton);

    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
  });

  it('switches to register view from login', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
  });

  it('switches back to login from register', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} initialView="register" />
    );

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('renders reset password form when resetToken is provided', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} resetToken="test-token" />
    );

    expect(screen.getByText(/set new password/i)).toBeInTheDocument();
  });

  it('renders email verification when verificationToken is provided', () => {
    renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} verificationToken="test-token" />
    );

    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
  });

  it('prevents body scroll when open', () => {
    const { rerender } = renderWithAuth(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <AuthProvider>
        <AuthModal isOpen={false} onClose={mockOnClose} />
      </AuthProvider>
    );

    expect(document.body.style.overflow).toBe('');
  });
});
