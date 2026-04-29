import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../ui/UserAvatar';

// Nav item shape
interface NavItem {
  id: string;
  label: string;
  icon: string; // SVG path d attribute
  path: string;
  roles: Array<'mentor' | 'learner' | 'admin'>;
}

// All navigation items — filtered by role before rendering
const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    path: '/mentor/dashboard',
    roles: ['mentor'],
  },
  {
    id: 'learner-dashboard',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    path: '/learner/dashboard',
    roles: ['learner'],
  },
  {
    id: 'sessions-mentor',
    label: 'Sessions',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    path: '/mentor/sessions',
    roles: ['mentor'],
  },
  {
    id: 'sessions-learner',
    label: 'My Sessions',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    path: '/learner/sessions',
    roles: ['learner'],
  },
  {
    id: 'find-mentors',
    label: 'Find Mentors',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    path: '/mentors',
    roles: ['learner'],
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    path: '/messages',
    roles: ['mentor', 'learner'],
  },
  {
    id: 'wallet-mentor',
    label: 'Wallet',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    path: '/mentor/wallet',
    roles: ['mentor'],
  },
  {
    id: 'payments-learner',
    label: 'Payments',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    path: '/learner/payments',
    roles: ['learner'],
  },
  {
    id: 'profile-mentor',
    label: 'Profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    path: '/mentor/profile',
    roles: ['mentor'],
  },
  {
    id: 'profile-learner',
    label: 'Profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    path: '/learner/profile',
    roles: ['learner'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    path: '/settings',
    roles: ['mentor', 'learner'],
  },
  // Admin nav items
  {
    id: 'admin-analytics',
    label: 'Analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    path: '/admin/analytics',
    roles: ['admin'],
  },
  {
    id: 'admin-revenue',
    label: 'Revenue',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    path: '/admin/revenue',
    roles: ['admin'],
  },
  {
    id: 'admin-users',
    label: 'Users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    path: '/admin/users',
    roles: ['admin'],
  },
  {
    id: 'admin-transactions',
    label: 'Transactions',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    path: '/admin/transactions',
    roles: ['admin'],
  },
  {
    id: 'admin-sessions',
    label: 'Sessions',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    path: '/admin/sessions',
    roles: ['admin'],
  },
  {
    id: 'admin-disputes',
    label: 'Disputes',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    path: '/admin/disputes',
    roles: ['admin'],
  },
  {
    id: 'admin-logs',
    label: 'Logs',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    path: '/admin/logs',
    roles: ['admin'],
  },
];

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const role = user?.role ?? 'learner';
  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(role as 'mentor' | 'learner' | 'admin'));

  // Skeleton state — user not yet loaded
  const isLoading = user === null;

  return (
    <aside
      className={`flex flex-col bg-background border-r border-border transition-all duration-200 shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      data-testid="sidebar"
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <span className="font-bold text-primary truncate">⭐ MentorMinds</span>
        )}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-2 rounded-lg hover:bg-surface text-muted-foreground ml-auto min-w-[44px] min-h-[44px] flex items-center justify-center"
          data-testid="sidebar-collapse-toggle"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* User identity */}
      <div className={`px-3 py-4 border-b border-border ${collapsed ? 'flex justify-center' : ''}`}>
        {isLoading ? (
          /* Skeleton placeholder */
          <div className="flex items-center gap-3" data-testid="sidebar-skeleton">
            <div className="w-9 h-9 rounded-full bg-surface animate-pulse shrink-0" />
            {!collapsed && (
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-surface rounded animate-pulse w-24" />
                <div className="h-2.5 bg-surface rounded animate-pulse w-16" />
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`} data-testid="sidebar-user-info">
            {/* Avatar */}
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              firstName={user?.firstName}
              lastName={user?.lastName}
              name={user?.name}
              size="sm"
              data-testid={user?.avatarUrl ? 'sidebar-avatar' : 'sidebar-avatar-fallback'}
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate" data-testid="sidebar-display-name">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize" data-testid="sidebar-role-label">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick stats */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-border" data-testid="sidebar-quick-stats">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Quick Stats
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Upcoming Sessions</span>
              <span className="font-semibold text-primary" data-testid="stat-upcoming-sessions">0</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Unread Messages</span>
              <span className="font-semibold text-primary" data-testid="stat-unread-messages">0</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto" aria-label="Main navigation">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.id}
              to={item.path}
              aria-label={item.label}
              className={({ isActive: navActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  navActive || isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-surface hover:text-text'
                } ${collapsed ? 'justify-center' : ''}`
              }
              data-testid={`nav-item-${item.id}`}
            >
              {({ isActive: navActive }) => (
                <>
                  {/* Active indicator bar */}
                  {(navActive || isActive) && !collapsed && (
                    <span className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" aria-hidden="true" />
                  )}
                  <svg
                    className="w-5 h-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
