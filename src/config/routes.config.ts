export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MENTORS: '/mentors',
  MENTOR_PROFILE: '/mentors/:id',
  SESSIONS: '/sessions',
  /** Pre-session waiting area before video room */
  SESSION_WAITING: '/sessions/:id/waiting',
  /** Live video session (after waiting room) */
  SESSION_ROOM: '/sessions/:id',
  HISTORY: '/history',
  PAYMENTS: '/payments',
  ONBOARDING: '/onboarding',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  MENTOR_ANALYTICS: '/mentor/analytics',
  LEARNER_ANALYTICS: '/learner/analytics',
  PLATFORM_STATS: '/stats',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  LOGIN: '/login',
  SIGNUP: '/signup',
  GOVERNANCE: '/governance',
  PROPOSAL_DETAIL: '/governance/proposals/:id',
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
  { path: ROUTES.MENTOR_ANALYTICS, label: 'Analytics', protected: true, roles: ['mentor'], icon: 'BarChart3' },
  { path: ROUTES.LEARNER_ANALYTICS, label: 'Learning Analytics', protected: true, roles: ['learner'], icon: 'LineChart' },
  { path: ROUTES.MENTORS, label: 'Explore Mentors', protected: true, icon: 'Search' },
{ path: '/mentor/sessions', label: 'My Sessions', protected: true, roles: ['mentor'], icon: 'Calendar' },
  { path: ROUTES.SESSIONS, label: 'Book Session', protected: true, roles: ['learner'], icon: 'Calendar' },
  { path: ROUTES.HISTORY, label: 'Learning History', protected: true, icon: 'History', roles: ['learner'] },
  { path: ROUTES.PAYMENTS, label: 'Payments', protected: true, icon: 'CreditCard' },
  { path: ROUTES.PLATFORM_STATS, label: 'Platform Stats', protected: false, icon: 'Globe' },
  { path: ROUTES.GOVERNANCE, label: 'Governance', protected: true, icon: 'Shield' },
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
    { path: ROUTES.PRIVACY, label: 'Privacy Policy' },
    { path: ROUTES.TERMS, label: 'Terms of Service' },
  ],
};
