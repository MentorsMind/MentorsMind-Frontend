import { useState } from 'react';

const SIDEBAR_COLLAPSED_KEY = 'mm_sidebar_collapsed';

export interface UseNavLayoutReturn {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
}

export function useNavLayout(): UseNavLayoutReturn {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return { drawerOpen, openDrawer, closeDrawer, sidebarCollapsed, toggleSidebarCollapse };
}
