export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MENTORS: '/mentors',
  SESSIONS: '/sessions',
  HISTORY: '/history',
  PAYMENTS: '/payments',
  ONBOARDING: '/onboarding',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGIN: '/login',
  SIGNUP: '/signup',
} as const;

export interface RouteConfig {
  path: string;
  label: string;
  protected?: boolean;
  roles?: ('mentor' | 'learner' | 'admin')[];
  icon?: string;
}

export const MAIN_NAVIGATION: RouteConfig[] = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', protected: true, icon: 'LayoutDashboard' },
  { path: ROUTES.MENTORS, label: 'Explore Mentors', protected: true, icon: 'Search' },
  { path: ROUTES.SESSIONS, label: 'Sessions', protected: true, icon: 'Calendar' },
  { path: ROUTES.HISTORY, label: 'Learning History', protected: true, icon: 'History', roles: ['learner'] },
  { path: ROUTES.PAYMENTS, label: 'Payments', protected: true, icon: 'CreditCard' },
];

export const USER_NAVIGATION: RouteConfig[] = [
  { path: ROUTES.PROFILE, label: 'My Profile', protected: true, icon: 'User' },
  { path: ROUTES.SETTINGS, label: 'Settings', protected: true, icon: 'Settings' },
];

export const FOOTER_NAVIGATION = {
  PLATFORM: [
    { path: ROUTES.MENTORS, label: 'Find a Mentor' },
    { path: ROUTES.DASHBOARD, label: 'Dashboard' },
  ],
  SUPPORT: [
    { path: '/help', label: 'Help Center' },
    { path: '/contact', label: 'Contact Us' },
  ],
  LEGAL: [
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/terms', label: 'Terms of Service' },
  ],
};
