import React from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { MainContent } from '../components/dashboard/MainContent';
import { DashboardProvider } from '../contexts/DashboardContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <MainContent>
          {children}
        </MainContent>
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
