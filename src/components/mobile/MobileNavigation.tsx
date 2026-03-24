import React from 'react';
import { Home, Search, Calendar, User, Menu } from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

interface MobileNavigationProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  className = '',
}) => {
  const { isMobile } = useMobile();

  if (!isMobile) return null;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom ${className}`}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/**
 * Default mobile navigation with common items
 */
export const DefaultMobileNav: React.FC<{
  activeItem: string;
  onItemClick: (id: string) => void;
}> = ({ activeItem, onItemClick }) => {
  const defaultItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-6 h-6" />,
      href: '/',
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="w-6 h-6" />,
      href: '/search',
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: <Calendar className="w-6 h-6" />,
      href: '/sessions',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-6 h-6" />,
      href: '/profile',
    },
  ];

  return (
    <MobileNavigation
      items={defaultItems}
      activeItem={activeItem}
      onItemClick={onItemClick}
    />
  );
};

/**
 * Mobile header component
 */
interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  showMenuButton = false,
  onMenuClick,
  rightAction,
  className = '',
}) => {
  const { isMobile } = useMobile();

  if (!isMobile) return null;

  return (
    <header
      className={`sticky top-0 z-30 bg-white border-b border-gray-200 safe-area-top ${className}`}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left action */}
        <div className="flex items-center">
          {showBackButton && onBackClick && (
            <button
              onClick={onBackClick}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          {showMenuButton && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Title */}
        <h1 className="flex-1 text-lg font-semibold text-gray-900 text-center truncate px-2">
          {title}
        </h1>

        {/* Right action */}
        <div className="flex items-center">
          {rightAction || <div className="w-10" />}
        </div>
      </div>
    </header>
  );
};

/**
 * Mobile tab bar for switching between views
 */
interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface MobileTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto scrollbar-hide bg-white border-b border-gray-200 px-4 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            )}
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        );
      })}
    </div>
  );
};
