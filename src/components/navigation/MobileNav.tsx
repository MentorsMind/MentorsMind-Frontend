import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  LayoutDashboard,
  Search,
  Calendar,
  CreditCard,
  User,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { MAIN_NAVIGATION, USER_NAVIGATION } from '../../config/routes.config';
import { useNavigation } from '../../hooks/useNavigation';
import type { AuthState } from '../../types';

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Search,
  Calendar,
  CreditCard,
  User,
  Settings
};

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  auth: AuthState;
  onLogout: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, auth, onLogout }) => {
  const { isActive } = useNavigation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Menu */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        <div className="p-5 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stellar rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-gray-900">MentorsMind</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          {/* User Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stellar/10 flex items-center justify-center text-stellar font-bold text-xl">
                {auth.user?.name ? auth.user.name[0] : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{auth.user?.name || 'Guest User'}</h3>
                <p className="text-xs text-gray-500">{auth.user?.email || 'Sign in to access all features'}</p>
              </div>
            </div>
            <div className="mt-4 inline-flex items-center px-2 py-1 bg-stellar/10 rounded-md">
              <span className="text-[10px] font-bold text-stellar uppercase tracking-wider">{auth.user?.role || 'Guest'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Main Menu</p>
              <div className="space-y-1">
                {MAIN_NAVIGATION.map((item) => {
                  const Icon = IconMap[item.icon || ''];
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${
                        active 
                          ? 'bg-stellar text-white shadow-lg shadow-stellar/20' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon size={20} />}
                        <span className="font-semibold text-sm">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className={active ? 'text-white/70' : 'text-gray-300'} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Settings</p>
              <div className="space-y-1">
                {USER_NAVIGATION.map((item) => {
                  const Icon = IconMap[item.icon || ''];
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${
                        active 
                          ? 'bg-stellar text-white shadow-lg shadow-stellar/20' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon size={20} />}
                        <span className="font-semibold text-sm">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className={active ? 'text-white/70' : 'text-gray-300'} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-50">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
