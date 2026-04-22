import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavItem { label: string; to: string; icon: string; }

const mentorNav: NavItem[] = [
  { label: 'Dashboard', to: '/mentor/dashboard', icon: '🏠' },
  { label: 'Sessions',  to: '/mentor/sessions',  icon: '📅' },
  { label: 'Wallet',    to: '/mentor/wallet',    icon: '💰' },
  { label: 'Profile',   to: '/mentor/profile',   icon: '👤' },
];

const learnerNav: NavItem[] = [
  { label: 'Dashboard',    to: '/learner/dashboard', icon: '🏠' },
  { label: 'Find Mentors', to: '/mentors',           icon: '🔍' },
  { label: 'My Sessions',  to: '/learner/sessions',  icon: '📅' },
  { label: 'Payments',     to: '/learner/payments',  icon: '💰' },
  { label: 'Profile',      to: '/learner/profile',   icon: '👤' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();
  const nav = user?.role === 'mentor' ? mentorNav : learnerNav;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          {!collapsed && <span className="font-bold text-indigo-600">⭐ MentorMinds</span>}
          <button onClick={() => setCollapsed(c => !c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 ml-auto">
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {nav.map(item => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${pathname.startsWith(item.to) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User info */}
        {!collapsed && user && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
