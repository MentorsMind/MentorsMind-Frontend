import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export interface SecondaryNavItem {
  id: string;
  label: string;
  icon: string;
  to: string;
}

// Settings icon
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// Wallet icon
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M16 12h.01" />
    <path d="M2 10h20" />
  </svg>
);

// Goals icon
const GoalsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const SECONDARY_NAV_ITEMS: SecondaryNavItem[] = [
  { id: 'settings', label: 'Settings', icon: 'settings', to: '/settings' },
  { id: 'wallet',   label: 'Wallet',   icon: 'wallet',   to: '/mentor/wallet' },
  { id: 'goals',    label: 'Goals',    icon: 'goals',    to: '/goals' },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  settings: <SettingsIcon />,
  wallet: <WalletIcon />,
  goals: <GoalsIcon />,
};

interface HamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  secondaryNavItems: SecondaryNavItem[];
}

export function HamburgerDrawer({ isOpen, onClose, secondaryNavItems }: HamburgerDrawerProps) {
  const { user } = useAuth();

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Back button interception
  useEffect(() => {
    if (!isOpen) return;

    // Push a dummy state so we can intercept the back button
    history.pushState({ hamburgerDrawer: true }, '');

    const handlePopState = () => {
      if (isOpen) {
        onClose();
        // Push another dummy state to prevent actual navigation
        history.pushState({ hamburgerDrawer: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = user?.name ?? '';
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed inset-y-0 left-0 z-50 w-72 bg-background flex flex-col shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* User info header */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-border">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-accent-foreground font-semibold text-lg">
              {displayName ? displayName.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-text truncate">{displayName || 'User'}</p>
            {roleLabel && (
              <p className="text-xs text-muted-foreground capitalize">{roleLabel}</p>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Secondary navigation">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 min-h-[44px] text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-accent'
                    : 'text-text hover:bg-surface hover:text-text'
                }`
              }
            >
              <span className="flex-shrink-0 text-current">
                {ICON_MAP[item.icon] ?? null}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
