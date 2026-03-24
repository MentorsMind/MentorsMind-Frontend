import React, { useState } from 'react';
import type { ReminderSettings } from '../../types';

interface Props {
  settings: ReminderSettings;
  onUpdate: (settings: Partial<ReminderSettings>) => void;
  onAddCustomTime: (minutes: number) => void;
  onRemoveCustomTime: (minutes: number) => void;
}

const ReminderSettingsComponent: React.FC<Props> = ({ 
  settings, 
  onUpdate, 
  onAddCustomTime, 
  onRemoveCustomTime 
}: Props) => {
  const [newTime, setNewTime] = useState('');

  const handleAddTime = () => {
    const mins = parseInt(newTime);
    if (!isNaN(mins) && mins > 0) {
      onAddCustomTime(mins);
      setNewTime('');
    }
  };

  const formatMinutes = (m: number) => {
    if (m >= 1440) return `${Math.floor(m / 1440)}d`;
    if (m >= 60) return `${Math.floor(m / 60)}h`;
    return `${m}m`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reminder Preferences</h2>
          <p className="text-sm text-gray-500">How and when you want to be notified about your sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ToggleButton
          label="Email Notifications"
          description="Get reminders in your inbox"
          icon="📧"
          active={settings.emailEnabled}
          onClick={() => onUpdate({ emailEnabled: !settings.emailEnabled })}
        />
        <ToggleButton
          label="SMS Notifications"
          description="Alerts to your phone"
          icon="📱"
          active={settings.smsEnabled}
          onClick={() => onUpdate({ smsEnabled: !settings.smsEnabled })}
        />
        <ToggleButton
          label="In-App Notifications"
          description="Alerts while browsing"
          icon="🔔"
          active={settings.inAppEnabled}
          onClick={() => onUpdate({ inAppEnabled: !settings.inAppEnabled })}
        />
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Reminder Timing</h3>
          <p className="text-sm text-gray-500 mb-6">Choose how far in advance you want to be reminded.</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {settings.customTimes.map((mins: number) => (
              <span 
                key={mins}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stellar/10 text-stellar text-sm font-bold rounded-xl"
              >
                {formatMinutes(mins)} before
                <button 
                  onClick={() => onRemoveCustomTime(mins)}
                  className="hover:text-stellar-dark transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input 
              type="number"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="Minutes before..."
              className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stellar/20 w-40"
            />
            <button 
              onClick={handleAddTime}
              className="px-6 py-2 bg-stellar text-white text-sm font-bold rounded-xl hover:bg-stellar-dark transition-all active:scale-95"
            >
              Add Reminder
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900">Session Preparation</p>
              <p className="text-xs text-gray-500">Receive a checklist 15 mins before session starts</p>
            </div>
            <input 
              type="checkbox"
              checked={settings.sessionPrepReminders}
              onChange={() => onUpdate({ sessionPrepReminders: !settings.sessionPrepReminders })}
              className="w-5 h-5 rounded-lg border-gray-300 text-stellar focus:ring-stellar"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900">Calendar Sync</p>
              <p className="text-xs text-gray-500">Auto-add reminder links for your calendar apps</p>
            </div>
            <input 
              type="checkbox"
              checked={settings.calendarSyncReminders}
              onChange={() => onUpdate({ calendarSyncReminders: !settings.calendarSyncReminders })}
              className="w-5 h-5 rounded-lg border-gray-300 text-stellar focus:ring-stellar"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl p-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold">Mentor-Specific Rules</h3>
            <p className="text-sm text-gray-400">Override your global settings for specific mentors.</p>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
            + Add Mentor
          </button>
        </div>
        
        {Object.keys(settings.mentorSpecificPreferences).length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 text-sm">
            No specific rules set for any mentor
          </div>
        ) : (
          <div className="space-y-3">
            {/* List mentor specific rules here */}
          </div>
        )}
      </div>
    </div>
  );
};

const ToggleButton: React.FC<{ 
  label: string; 
  description: string; 
  icon: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ label, description, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2rem] border-2 text-left transition-all ${
      active 
        ? 'border-stellar bg-stellar/5 ring-4 ring-stellar/10' 
        : 'border-white bg-white hover:border-stellar/30'
    } shadow-sm`}
  >
    <div className="text-3xl mb-4">{icon}</div>
    <div className="font-bold text-gray-900 mb-1">{label}</div>
    <div className="text-xs text-gray-500">{description}</div>
  </button>
);

export default ReminderSettingsComponent;
