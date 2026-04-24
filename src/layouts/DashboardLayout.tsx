import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMobile } from '../hooks/useMobile';
import { useNavLayout } from '../hooks/useNavLayout';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { Sidebar } from '../components/dashboard/Sidebar';
import { BottomTabBar, MENTOR_TABS, LEARNER_TABS } from '../components/navigation/BottomTabBar';
import { HamburgerDrawer, SECONDARY_NAV_ITEMS } from '../components/navigation/HamburgerDrawer';
import usePushNotifications from '../hooks/usePushNotifications';
import { PermissionBanner } from '../components/notifications/PermissionBanner';
import { DeniedTooltip } from '../components/notifications/DeniedTooltip';

// Hamburger icon
const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const { drawerOpen, openDrawer, closeDrawer, sidebarCollapsed, toggleSidebarCollapse } =
    useNavLayout();
  const {
    showBanner,
    showDeniedTooltip,
    requestPermission,
    dismissBanner,
    dismissDeniedTooltip,
    isRegistering,
    registrationError,
  } = usePushNotifications();

  const { swipeProgress, containerProps } = useSwipeBack({ enabled: isMobile });

  const tabs = user?.role === 'mentor' ? MENTOR_TABS : LEARNER_TABS;

  return (
    // Root container: min-h uses 100dvh (avoids iOS Safari 100vh bug) with -webkit-fill-available fallback.
    // overflow-x: hidden prevents any child from causing horizontal scroll (Req 7.2, 8.1).
    <div
      className="flex bg-surface overflow-x-hidden"
      style={{ minHeight: '-webkit-fill-available' }}
      data-testid="dashboard-layout-root"
      {...containerProps}
    >
      <style>{`
        [data-testid="dashboard-layout-root"] {
          min-height: 100dvh;
        }
      `}</style>

      {/* Desktop sidebar — hidden on mobile, flex on md+ (Req 1.1) */}
      <div className="hidden md:flex">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebarCollapse} />
      </div>

      {/* Page body */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top header — visible only on mobile (Req 3.1) */}
        <header className="flex md:hidden items-center justify-between h-14 px-4 bg-background border-b border-border shrink-0">
          <span className="font-bold text-primary">⭐ MentorMinds</span>
          <button
            onClick={openDrawer}
            aria-label="Open navigation menu"
            className="p-2.5 rounded-lg hover:bg-surface text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
            data-testid="hamburger-button"
          >
            <HamburgerIcon />
          </button>
        </header>

        {/* Push notification banners — rendered above main content */}
        {showBanner && (
          <PermissionBanner
            onEnable={requestPermission}
            onDismiss={dismissBanner}
            isLoading={isRegistering}
            error={registrationError}
          />
        )}
        {showDeniedTooltip && <DeniedTooltip onDismiss={dismissDeniedTooltip} />}

        {/* Main content — overscroll-behavior: contain prevents pull-to-refresh bleed;
            -webkit-overflow-scrolling: touch enables momentum scrolling on iOS (Req 8.6).
            pb-[calc(4rem+env(safe-area-inset-bottom))] on mobile accounts for tab bar height + safe area (Req 2.1). */}
        <main
          className="flex-1 overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          data-testid="dashboard-main"
        >
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar — hidden on desktop, flex on mobile (Req 2.1) */}
      <div className="flex md:hidden">
        <BottomTabBar tabs={tabs} onHamburgerPress={openDrawer} />
      </div>

      {/* Hamburger drawer — controlled by drawerOpen / closeDrawer (Req 3.1) */}
      <HamburgerDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        secondaryNavItems={SECONDARY_NAV_ITEMS}
      />

      {/* Swipe-back progress indicator — translucent left-edge bar (Req 6.3) */}
      {swipeProgress > 0 && (
        <div
          aria-hidden="true"
          data-testid="swipe-back-indicator"
          className="fixed inset-y-0 left-0 z-50 pointer-events-none"
          style={{
            width: `${swipeProgress * 100}%`,
            maxWidth: '60px',
            background: 'linear-gradient(to right, rgba(99,102,241,0.35), transparent)',
            opacity: Math.min(swipeProgress * 2, 0.9),
          }}
        />
      )}
    </div>
  );
}
