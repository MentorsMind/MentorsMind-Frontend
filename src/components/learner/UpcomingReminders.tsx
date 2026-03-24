import React, { useState } from 'react';
import type { Reminder, ReminderHistoryItem } from '../../types';

interface Props {
  reminders: Reminder[];
  history: ReminderHistoryItem[];
  onSnooze: (id: string) => void;
  onDismiss: (id: string) => void;
}

const UpcomingReminders: React.FC<Props> = ({ 
  reminders, 
  history, 
  onSnooze, 
  onDismiss 
}: Props) => {
  const [showHistory, setShowHistory] = useState(false);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Reminders</h2>
          <p className="text-sm text-gray-500">Stay on top of your upcoming sessions.</p>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            showHistory 
              ? 'bg-gray-900 text-white' 
              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          {showHistory ? 'View Upcoming' : 'View History'}
        </button>
      </div>

      {!showHistory ? (
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="text-4xl mb-4">💤</div>
              <h3 className="font-bold text-gray-900 mb-1">No upcoming reminders</h3>
              <p className="text-sm text-gray-500">Schedule a session or adjust your settings to see them here.</p>
            </div>
          ) : (
            reminders.map((rem: Reminder) => (
              <div key={rem.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-stellar/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                    rem.type === 'email' ? 'bg-blue-50 text-blue-500' :
                    rem.type === 'sms' ? 'bg-green-50 text-green-500' :
                    rem.type === 'prep' ? 'bg-amber-50 text-amber-500' :
                    'bg-stellar/5 text-stellar'
                  }`}>
                    {rem.type === 'email' ? '📧' : rem.type === 'sms' ? '📱' : rem.type === 'prep' ? '📝' : '🔔'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-tight mb-1">{rem.message}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-stellar" />
                      Scheduled for {formatTime(rem.scheduledTime)}
                      {rem.snoozeCount > 0 && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] uppercase font-bold text-gray-400">
                          Snoozed {rem.snoozeCount}x
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onSnooze(rem.id)}
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-stellar transition-colors"
                    title="Snooze 15 mins"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onDismiss(rem.id)}
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    title="Dismiss"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Message</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sent At</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                    No reminder history yet
                  </td>
                </tr>
              ) : (
                history.map((item: ReminderHistoryItem) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm shadow-sm">
                        {item.type === 'email' ? '📧' : item.type === 'sms' ? '📱' : item.type === 'prep' ? '📝' : '🔔'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{item.message}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatTime(item.sentAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'sent' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UpcomingReminders;
