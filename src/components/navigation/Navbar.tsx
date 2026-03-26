import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  LogOut,
  LayoutDashboard,
  Search,
  Calendar,
  CreditCard,
  User,
  Settings
} from 'lucide-react';
import { MAIN_NAVIGATION, USER_NAVIGATION, ROUTES } from '../../config/routes.config';
import { useNavigation } from '../../hooks/useNavigation';
import { MobileNav } from './MobileNav';
import type { AuthState } from '../../types';

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Search,
  Calendar,
  CreditCard,
  User,
  Settings
};

interface NavbarProps {
  auth: AuthState;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ auth, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isActive } = useNavigation();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center gap-8">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-stellar rounded-xl flex items-center justify-center shadow-lg shadow-stellar/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                MentorsMind
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {MAIN_NAVIGATION.filter(item => {
                const role = auth.user?.role as 'mentor' | 'learner' | 'admin' | undefined;
                if (!item.roles) return true;
                if (!role) return false;
                return item.roles.includes(role);
              }).map((item) => {
                const Icon = IconMap[item.icon || ''];
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active 
                        ? 'text-stellar bg-stellar/5 h-10' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {Icon && <Icon size={18} className={active ? 'text-stellar' : 'text-gray-400'} />}
                    {item.label}
                    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stellar rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side: Search, Notifications, User */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-gray-400 hover:text-stellar hover:bg-stellar/5 rounded-full transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-stellar hover:bg-stellar/5 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-xl border border-gray-100 hover:border-stellar/30 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col items-end hidden lg:flex">
                  <span className="text-xs font-semibold text-gray-900">{auth.user?.name || 'Guest'}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{auth.user?.role || 'User'}</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-500 font-bold">
                  {auth.user?.name ? auth.user.name[0] : 'U'}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-0" 
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {USER_NAVIGATION.map((item) => {
                        const Icon = IconMap[item.icon || ''];
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-stellar hover:bg-stellar/5 rounded-xl transition-colors"
                          >
                            {Icon && <Icon size={18} />}
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-50 p-2">
                      <button
                        onClick={() => {
                          onLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        auth={auth}
        onLogout={onLogout}
      />
    </nav>
  );
};
