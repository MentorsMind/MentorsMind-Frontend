import { useState, useEffect, useCallback } from 'react';
import {
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  getCurrentBreakpoint,
  debounce,
  type Breakpoint,
} from '../utils/responsive.utils';

interface UseMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  breakpoint: Breakpoint;
  orientation: 'portrait' | 'landscape';
  isOnline: boolean;
}

/**
 * Hook for mobile-responsive behavior
 */
export const useMobile = (): UseMobileReturn => {
  const [state, setState] = useState<UseMobileReturn>(() => ({
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    isTouchDevice: isTouchDevice(),
    breakpoint: getCurrentBreakpoint(),
    orientation: typeof window !== 'undefined' && window.innerHeight > window.innerWidth 
      ? 'portrait' 
      : 'landscape',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  }));

  const handleResize = useCallback(
    debounce(() => {
      setState({
        isMobile: isMobile(),
        isTablet: isTablet(),
        isDesktop: isDesktop(),
        isTouchDevice: isTouchDevice(),
        breakpoint: getCurrentBreakpoint(),
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        isOnline: navigator.onLine,
      });
    }, 150),
    []
  );

  const handleOnlineStatus = useCallback(() => {
    setState(prev => ({ ...prev, isOnline: navigator.onLine }));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [handleResize, handleOnlineStatus]);

  return state;
};

/**
 * Hook for viewport dimensions
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 150);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

/**
 * Hook for detecting scroll direction
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return scrollDirection;
};

/**
 * Hook for safe area insets (notched devices)
 */
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
      const updateSafeArea = () => {
        const style = getComputedStyle(document.documentElement);
        setSafeArea({
          top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
          right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
          bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
          left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
        });
      };

      updateSafeArea();
      window.addEventListener('resize', updateSafeArea);
      return () => window.removeEventListener('resize', updateSafeArea);
    }
  }, []);

  return safeArea;
};
