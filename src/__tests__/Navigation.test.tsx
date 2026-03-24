import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { MobileNav } from '../components/navigation/MobileNav';
import { ProtectedRoute } from '../components/navigation/ProtectedRoute';
import { RoleBasedRoute } from '../components/navigation/RoleBasedRoute';
import { ROUTES } from '../config/routes.config';
import { vi } from 'vitest';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="icon-menu" />,
  X: () => <div data-testid="icon-x" />,
  Search: () => <div data-testid="icon-search" />,
  Bell: () => <div data-testid="icon-bell" />,
  ChevronDown: () => <div data-testid="icon-chevron-down" />,
  ChevronRight: () => <div data-testid="icon-chevron-right" />,
  LogOut: () => <div data-testid="icon-logout" />,
  LayoutDashboard: () => <div data-testid="icon-dashboard" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  CreditCard: () => <div data-testid="icon-credit-card" />,
  User: () => <div data-testid="icon-user" />,
  Settings: () => <div data-testid="icon-settings" />,
  Home: () => <div data-testid="icon-home" />,
  Globe: () => <div data-testid="icon-globe" />,
  Users: () => <div data-testid="icon-users" />,
  Share2: () => <div data-testid="icon-share" />,
  Heart: () => <div data-testid="icon-heart" />,
}));
import type { AuthState, User } from '../types';

const MOCK_USER: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'learner',
};

const MOCK_AUTH_AUTHENTICATED: AuthState = {
  user: MOCK_USER,
  isAuthenticated: true,
  isLoading: false,
};

const MOCK_AUTH_UNAUTHENTICATED: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const MOCK_AUTH_LOADING: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

describe('Navbar Component', () => {
  it('renders brand name', () => {
    render(
      <MemoryRouter>
        <Navbar auth={MOCK_AUTH_AUTHENTICATED} onLogout={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/MentorsMind/i)).toBeInTheDocument();
  });

  it('renders navigation links for authenticated users', () => {
    render(
      <MemoryRouter>
        <Navbar auth={MOCK_AUTH_AUTHENTICATED} onLogout={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore Mentors/i)).toBeInTheDocument();
  });

  it('shows user menu when clicked', () => {
    render(
      <MemoryRouter>
        <Navbar auth={MOCK_AUTH_AUTHENTICATED} onLogout={() => {}} />
      </MemoryRouter>
    );
    const userButton = screen.getByText(MOCK_USER.name);
    fireEvent.click(userButton);
    expect(screen.getByText(/My Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
  });
});

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute auth={MOCK_AUTH_AUTHENTICATED}>
          <div data-testid="protected-content">Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('shows loading state when auth is loading', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute auth={MOCK_AUTH_LOADING}>
          <div>Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading secure session/i)).toBeInTheDocument();
  });

  it('redirects when unauthenticated', () => {
    // Note: We can't easily test Navigate with just render/screen without a more complex setup,
    // but we can at least assert that children are NOT rendered
    render(
      <MemoryRouter>
        <ProtectedRoute auth={MOCK_AUTH_UNAUTHENTICATED}>
          <div data-testid="protected-content">Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

describe('RoleBasedRoute', () => {
  it('renders children when role is allowed', () => {
    render(
      <MemoryRouter>
        <RoleBasedRoute auth={MOCK_AUTH_AUTHENTICATED} allowedRoles={['learner']}>
          <div data-testid="role-content">Role Content</div>
        </RoleBasedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('role-content')).toBeInTheDocument();
  });

  it('redirects when role is not allowed', () => {
    render(
      <MemoryRouter>
        <RoleBasedRoute auth={MOCK_AUTH_AUTHENTICATED} allowedRoles={['mentor']}>
          <div data-testid="role-content">Role Content</div>
        </RoleBasedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('role-content')).not.toBeInTheDocument();
  });
});

describe('MobileNav Component', () => {
  it('renders when open', () => {
    render(
      <MemoryRouter>
        <MobileNav 
          isOpen={true} 
          onClose={() => {}} 
          auth={MOCK_AUTH_AUTHENTICATED} 
          onLogout={() => {}} 
        />
      </MemoryRouter>
    );
    expect(screen.getByText(/Main Menu/i)).toBeInTheDocument();
    expect(screen.getByText(MOCK_USER.name)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MemoryRouter>
        <MobileNav 
          isOpen={false} 
          onClose={() => {}} 
          auth={MOCK_AUTH_AUTHENTICATED} 
          onLogout={() => {}} 
        />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Main Menu/i)).not.toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const onLogout = vi.fn();
    render(
      <MemoryRouter>
        <MobileNav 
          isOpen={true} 
          onClose={() => {}} 
          auth={MOCK_AUTH_AUTHENTICATED} 
          onLogout={onLogout} 
        />
      </MemoryRouter>
    );
    const logoutButton = screen.getByText(/Sign Out/i);
    fireEvent.click(logoutButton);
    expect(onLogout).toHaveBeenCalled();
  });
});
