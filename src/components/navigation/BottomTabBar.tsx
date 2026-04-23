import { NavLink } from 'react-router-dom';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  to: string;
}

// Inline SVG icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const MENTOR_TABS: TabItem[] = [
  { id: 'home',     label: 'Home',     icon: <HomeIcon />,     to: '/mentor/dashboard' },
  { id: 'search',   label: 'Search',   icon: <SearchIcon />,   to: '/mentors' },
  { id: 'bookings', label: 'Bookings', icon: <CalendarIcon />, to: '/mentor/sessions' },
  { id: 'messages', label: 'Messages', icon: <MessageIcon />,  to: '/messages' },
  { id: 'profile',  label: 'Profile',  icon: <UserIcon />,     to: '/mentor/profile' },
];

export const LEARNER_TABS: TabItem[] = [
  { id: 'home',     label: 'Home',     icon: <HomeIcon />,     to: '/learner/dashboard' },
  { id: 'search',   label: 'Search',   icon: <SearchIcon />,   to: '/mentors' },
  { id: 'bookings', label: 'Bookings', icon: <CalendarIcon />, to: '/learner/sessions' },
  { id: 'messages', label: 'Messages', icon: <MessageIcon />,  to: '/messages' },
  { id: 'profile',  label: 'Profile',  icon: <UserIcon />,     to: '/learner/profile' },
];

interface BottomTabBarProps {
  tabs: TabItem[];
  onHamburgerPress: () => void;
}

export function BottomTabBar({ tabs }: BottomTabBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary navigation"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 gap-0.5 text-xs font-medium transition-colors min-h-[44px] min-w-[44px] py-2 px-1 ${
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-text'
            }`
          }
          aria-label={tab.label}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
