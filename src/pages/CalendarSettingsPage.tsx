import React from 'react';
import CalendarSettings from '../components/settings/CalendarSettings';

const CalendarSettingsPage: React.FC = () => (
  <div className="max-w-2xl mx-auto px-4 py-8">
    <div className="mb-6">
      <h1 className="text-2xl font-black text-text tracking-tight">Calendar Settings</h1>
      <p className="text-muted-foreground mt-1">Connect your Google Calendar to sync sessions.</p>
    </div>
    <CalendarSettings />
  </div>
);

export default CalendarSettingsPage;
