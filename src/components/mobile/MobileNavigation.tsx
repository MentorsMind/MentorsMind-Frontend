import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const mentorLinks = [
  { to: '/mentor/dashboard', icon: '🏠', label: 'Home' },
  { to: '/mentor/sessions',  icon: '📅', label: 'Sessions' },
  { to: '/mentor/wallet',    icon: '💰', label: 'Wallet' },
  { to: '/mentor/profile',   icon: '👤', label: 'Profile' },
];

const learnerLinks = [
  { to: '/learner/dashboard', icon: '🏠', label: 'Home' },
  { to: '/mentors',           icon: '🔍', label: 'Find' },
  { to: '/learner/sessions',  icon: '📅', label: 'Sessions' },
  { to: '/learner/profile',   icon: '👤', label: 'Profile' },
];

export default function MobileNavigation() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const links = user?.role === 'mentor' ? mentorLinks : learnerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-40">
      {links.map(l => (
        <Link key={l.to} to={l.to}
          className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors
            ${pathname.startsWith(l.to) ? 'text-indigo-600' : 'text-gray-500'}`}>
          <span className="text-xl">{l.icon}</span>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
