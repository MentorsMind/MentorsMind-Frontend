# Authentication Components

Complete authentication system with login, registration, password reset, and email verification.

## Components

### AuthModal
Main modal wrapper that manages authentication flows.

```tsx
import AuthModal from './components/auth/AuthModal';

<AuthModal
  isOpen={showAuth}
  onClose={() => setShowAuth(false)}
  initialView="login" // 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email'
  onAuthSuccess={() => console.log('Authenticated!')}
/>
```

### LoginForm
Email/password login with validation and remember me functionality.

**Features:**
- Email validation
- Password visibility toggle
- Remember me checkbox
- Social login buttons (future-ready)
- Loading states
- Error handling

### RegisterForm
User registration with Stellar wallet creation.

**Features:**
- Full name, email, password validation
- Password strength indicator
- Password confirmation
- Role selection (learner/mentor)
- Stellar wallet creation notice
- Terms acceptance
- Loading states

### ForgotPasswordForm
Password reset request form.

**Features:**
- Email validation
- Success confirmation
- Resend instructions
- Error handling

### ResetPasswordForm
New password creation with token validation.

**Features:**
- Password strength indicator
- Password confirmation
- Requirements checklist
- Token validation
- Success confirmation

### EmailVerification
Email verification flow with resend capability.

**Features:**
- Verification status tracking
- Resend with cooldown
- Skip option
- Auto-redirect on success
- Limited access warning

## Context & Hooks

### AuthContext
Provides authentication state and methods throughout the app.

```tsx
import { AuthProvider } from './contexts/AuthContext';

<AuthProvider>
  <App />
</AuthProvider>
```

### useAuth Hook
Access authentication functionality in any component.

```tsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    clearError
  } = useAuth();

  // Use authentication methods
}
```

## Usage Example

```tsx
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import AuthModal from './components/auth/AuthModal';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => setShowAuth(true)}>Sign In</button>
      )}

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={() => {
          setShowAuth(false);
          console.log('User authenticated!');
        }}
      />
    </div>
  );
}

// Wrap with AuthProvider
export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
```

## Form Validation

All forms include comprehensive validation:

- **Email**: Format validation with regex
- **Password**: Minimum length, complexity requirements
- **Name**: Minimum 2 characters
- **Password Confirmation**: Must match password
- **Terms**: Must be accepted for registration

## Error Handling

Errors are displayed inline with:
- Field-specific validation messages
- Global error alerts
- Accessible error announcements
- Clear error states

## Loading States

All forms show loading indicators during:
- Form submission
- API calls
- Redirects
- Email verification

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader announcements
- Error state communication
- High contrast support

## Testing

Run tests with:
```bash
npm test
```

Test files include:
- `LoginForm.test.tsx` - Login form validation and submission
- `RegisterForm.test.tsx` - Registration flow and validation
- `AuthModal.test.tsx` - Modal behavior and view switching

## Integration

The authentication system integrates with:
- Stellar blockchain for wallet creation
- Email service for verification
- Session management (localStorage/sessionStorage)
- Protected routes
- Role-based access control

## Security Features

- Password strength validation
- Secure password storage (hashed)
- Token-based password reset
- Email verification
- Session management
- Remember me functionality
- CSRF protection ready

## Future Enhancements

- Social login integration (Google, GitHub)
- Two-factor authentication
- Biometric authentication
- OAuth2 support
- SSO integration
