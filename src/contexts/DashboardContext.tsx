import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardState, UserRole, WidgetConfig } from '../types/dashboard.types';

interface DashboardContextType extends DashboardState {
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  toggleTheme: () => void;
  setRole: (role: UserRole) => void;
  setSearchQuery: (query: string) => void;
  updateWidgets: (widgets: WidgetConfig[]) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  setLoading: (isLoading: boolean) => void;
}

const STORAGE_KEY = 'dashboard_state';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'stats', title: 'Stats', type: 'stats', size: 'medium', visible: true, order: 1 },
  { id: 'sessions', title: 'Upcoming Sessions', type: 'sessions', size: 'large', visible: true, order: 2 },
  { id: 'earnings', title: 'Earnings', type: 'earnings', size: 'small', visible: true, order: 3 },
  { id: 'activity', title: 'Recent Activity', type: 'activity', size: 'medium', visible: true, order: 4 },
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DashboardState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          isSidebarOpen: window.innerWidth >= 1024, // Reset on reload for responsiveness
          searchQuery: '', // Don't persist search
          isLoading: false,
        };
      } catch (e) {
        console.error('Failed to parse stored dashboard state', e);
      }
    }
    return {
      isSidebarOpen: window.innerWidth >= 1024,
      isSidebarCollapsed: false,
      theme: 'light',
      role: 'learner',
      widgets: DEFAULT_WIDGETS,
      searchQuery: '',
      isLoading: false,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isSidebarCollapsed: state.isSidebarCollapsed,
      theme: state.theme,
      role: state.role,
      widgets: state.widgets,
    }));
    
    // Apply theme
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme, state.role, state.isSidebarCollapsed, state.widgets]);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setState((prev) => ({ ...prev, isSidebarCollapsed: !prev.isSidebarCollapsed }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setState((prev) => ({ ...prev, role }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const updateWidgets = useCallback((widgets: WidgetConfig[]) => {
    setState((prev) => ({ ...prev, widgets }));
  }, []);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      ),
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const value = useMemo(() => ({
    ...state,
    toggleSidebar,
    toggleSidebarCollapse,
    toggleTheme,
    setRole,
    setSearchQuery,
    updateWidgets,
    toggleWidgetVisibility,
    setLoading,
  }), [
    state,
    toggleSidebar,
    toggleSidebarCollapse,
    toggleTheme,
    setRole,
    setSearchQuery,
    updateWidgets,
    toggleWidgetVisibility,
    setLoading,
  ]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
