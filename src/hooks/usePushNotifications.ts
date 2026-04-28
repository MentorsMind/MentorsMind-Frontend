import { useState, useCallback } from 'react';
import pushNotificationService from '../services/pushNotification.service';
import { deriveDeviceName } from '../utils/pushNotification.utils';

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
const PERMISSION_STATE_KEY = 'mm_push_permission_state';
const BANNER_DISMISSED_KEY = 'mm_push_banner_dismissed';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isBrowserSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function readPermissionState(): NotificationPermission {
  const stored = localStorage.getItem(PERMISSION_STATE_KEY);
  if (stored === 'granted' || stored === 'denied') return stored;
  return 'default';
}

function isBannerDismissed(): boolean {
  return sessionStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
}

function deriveShowBanner(permissionState: NotificationPermission): boolean {
  if (!isBrowserSupported()) return false;
  if (permissionState !== 'default') return false;
  if (isBannerDismissed()) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface UsePushNotificationsReturn {
  permissionState: NotificationPermission;
  showBanner: boolean;
  requestPermission: () => Promise<void>;
  dismissBanner: () => void;
  isRegistering: boolean;
  registrationError: string | null;
  showDeniedTooltip: boolean;
  dismissDeniedTooltip: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export default function usePushNotifications(): UsePushNotificationsReturn {
  const [permissionState, setPermissionState] = useState<NotificationPermission>(readPermissionState);
  const [showBanner, setShowBanner] = useState<boolean>(() => deriveShowBanner(readPermissionState()));
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [showDeniedTooltip, setShowDeniedTooltip] = useState(false);

  const dismissBanner = useCallback(() => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setShowBanner(false);
  }, []);

  const dismissDeniedTooltip = useCallback(() => {
    setShowDeniedTooltip(false);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isBrowserSupported()) return;

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const result = await Notification.requestPermission();

      if (result === 'granted') {
        setPermissionState('granted');
        try {
          // Mock Firebase subscription for offline environment
          console.log('Mocking push notification subscription');
          await pushNotificationService.subscribe('MOCK_FCM_TOKEN', deriveDeviceName(navigator.userAgent));
          localStorage.setItem(PERMISSION_STATE_KEY, 'granted');
          dismissBanner();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
          setRegistrationError(message);
        }
      } else if (result === 'denied') {
        setPermissionState('denied');
        localStorage.setItem(PERMISSION_STATE_KEY, 'denied');
        setShowBanner(false);
        setShowDeniedTooltip(true);
      }
    } finally {
      setIsRegistering(false);
    }
  }, [dismissBanner]);

  return {
    permissionState,
    showBanner,
    requestPermission,
    dismissBanner,
    isRegistering,
    registrationError,
    showDeniedTooltip,
    dismissDeniedTooltip,
  };
}
