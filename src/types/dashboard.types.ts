export type UserRole = 'mentor' | 'mentee';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
}

export interface WidgetConfig {
  id: string;
  title: string;
  type: string;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  order: number;
}

export interface DashboardState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  role: UserRole;
  widgets: WidgetConfig[];
  searchQuery: string;
  isLoading: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}
