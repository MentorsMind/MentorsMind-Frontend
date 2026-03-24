import React from 'react';
import { useReminders } from '../hooks/useReminders';
import ReminderSettings from '../components/learner/ReminderSettings';
import UpcomingReminders from '../components/learner/UpcomingReminders';
import type { Session } from '../types';

// Mock sessions for demonstration
const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    learnerId: 'l1',
    learnerName: 'Emma',
    topic: 'React Design Patterns & Clean Code',
    startTime: new Date(Date.now() + 3600000 * 2).toISOString(), // 2 hours from now
    duration: 60,
    status: 'confirmed',
    price: 50,
    currency: 'XLM',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 's2',
    learnerId: 'l1',
    learnerName: 'Emma',
    topic: 'Advanced TypeScript: Utility Types',
    startTime: new Date(Date.now() + 86400000 * 1.5).toISOString(), // 1.5 days from now
    duration: 45,
    status: 'pending',
    price: 40,
    currency: 'USDC',
  }
];

const LearnerDashboard: React.FC = () => {
  const { 
    settings, 
    upcomingReminders, 
    history, 
    updateSettings, 
    snoozeReminder, 
    dismissReminder,
    addCustomTime,
    removeCustomTime
  } = useReminders(MOCK_SESSIONS);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome back, <span className="text-stellar">Emma</span></h1>
          <p className="text-gray-500 mt-2 font-medium">You have {MOCK_SESSIONS.length} upcoming sessions this week.</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 font-bold">128</div>
             <div className="text-xs">
               <div className="font-bold text-gray-900 leading-none">XLM</div>
               <div className="text-gray-400">Balance</div>
             </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <UpcomingReminders 
            reminders={upcomingReminders}
            history={history}
            onSnooze={(id: string) => snoozeReminder(id)}
            onDismiss={(id: string) => dismissReminder(id)}
          />
          
          <div className="bg-gradient-to-br from-stellar to-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-stellar/20">
            <h3 className="text-xl font-bold mb-2">Prepare for your next session</h3>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">Preparation is key to a successful mentoring session. Review these tips to make the most of your time.</p>
            <button className="w-full py-3 bg-white text-stellar font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95">
              Prep Toolkit
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ReminderSettings 
            settings={settings}
            onUpdate={updateSettings}
            onAddCustomTime={addCustomTime}
            onRemoveCustomTime={removeCustomTime}
          />
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;
