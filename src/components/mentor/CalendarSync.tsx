import React, { useState } from 'react';

interface CalendarSyncProps {
  onSync: (provider: 'google' | 'outlook' | 'apple') => void;
  syncedCalendars: string[];
}

export const CalendarSync = ({ onSync, syncedCalendars }: CalendarSyncProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const providers = [
    { id: 'google', name: 'Google Calendar', icon: '📅', color: 'blue' },
    { id: 'outlook', name: 'Outlook Calendar', icon: '📧', color: 'indigo' },
    { id: 'apple', name: 'Apple Calendar', icon: '🍎', color: 'gray' },
  ];

  const handleConnect = (provider: 'google' | 'outlook' | 'apple') => {
    onSync(provider);
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
      >
        <span>🔗</span>
        <span>Sync Calendar</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Calendar Sync</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Connect your calendar to automatically sync your availability and prevent double bookings.
            </p>

            <div className="space-y-3">
              {providers.map((provider) => {
                const isConnected = syncedCalendars.includes(provider.id);
                
                return (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{provider.name}</h4>
                        {isConnected && (
                          <span className="text-xs text-green-600">✓ Connected</span>
                        )}
                      </div>
                    </div>
                    
                    {isConnected ? (
                      <button
                        onClick={() => handleConnect(provider.id as any)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(provider.id as any)}
                        className={`px-4 py-2 bg-${provider.color}-600 text-white rounded-lg hover:bg-${provider.color}-700 text-sm`}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Calendar sync is two-way. Your availability will be updated based on your calendar events, and booked sessions will be added to your calendar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
