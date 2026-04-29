import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { connectGoogleCalendar, disconnectGoogleCalendar } from '../../services/calendar.service';

const CalendarSettings: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('connected') === 'true') {
      setConnected(true);
      toast.success('Google Calendar connected');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('error') === 'access_denied') {
      setError('Google Calendar access was denied. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleConnect = () => {
    setConnecting(true);
    connectGoogleCalendar(); // navigates away
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const ok = await disconnectGoogleCalendar();
      if (ok) {
        setConnected(false);
        toast.success('Google Calendar disconnected');
      } else {
        toast.error('Failed to disconnect Google Calendar');
      }
    } catch {
      toast.error('Failed to disconnect Google Calendar');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-5 border border-border rounded-2xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Google Calendar</p>
            <p className="text-xs text-muted-foreground">Sync your sessions with Google Calendar</p>
          </div>
          {connected && (
            <span className="ml-auto flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">
              <CheckCircle className="w-3 h-3" /> Connected
            </span>
          )}
        </div>

        {connected ? (
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-semibold rounded-xl hover:bg-surface transition-colors disabled:opacity-50"
          >
            {disconnecting && <Loader2 className="w-4 h-4 animate-spin" />}
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-2 px-4 py-2 bg-stellar text-white text-sm font-semibold rounded-xl hover:bg-stellar-dark transition-colors disabled:opacity-50"
          >
            {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
            Connect Google Calendar
          </button>
        )}
      </div>
    </div>
  );
};

export default CalendarSettings;
