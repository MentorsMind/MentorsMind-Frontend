import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import Button from '../components/ui/Button';
import { calendarService } from '../services/calendar.service';

type CalendarState = 'success' | 'error' | 'incomplete' | 'default';

interface CalendarError {
  message: string;
  code?: string;
}

interface ICalData {
  icalUrl: string;
}

const CalendarSettings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<CalendarState>('default');
  const [error, setError] = useState<CalendarError | null>(null);
  const [icalData, setIcalData] = useState<ICalData | null>(null);
  const [isLoadingICal, setIsLoadingICal] = useState(false);
  const [showRegenerateWarning, setShowRegenerateWarning] = useState(false);
  const [showInvalidationBanner, setShowInvalidationBanner] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const determineState = () => {
      const connected = searchParams.get('connected');
      const errorParam = searchParams.get('error');
      const wasOAuthPending = sessionStorage.getItem('calendarOAuthPending');

      // Clear the OAuth pending flag
      sessionStorage.removeItem('calendarOAuthPending');

      if (connected === 'true') {
        setState('success');
        setError(null);
      } else if (errorParam) {
        setState('error');
        setError({
          message: decodeURIComponent(errorParam),
          code: searchParams.get('error_code') || undefined
        });
      } else if (wasOAuthPending === 'true') {
        // User was in OAuth flow but didn't return with success/error params
        setState('incomplete');
        setError({
          message: 'Something went wrong connecting Google Calendar. Please try again.'
        });
      } else {
        setState('default');
        setError(null);
      }

      setIsLoading(false);
    };

    // Small delay to ensure smooth transition
    const timer = setTimeout(determineState, 500);
    return () => clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    fetchICalUrl();
  }, []);

  const fetchICalUrl = async () => {
    try {
      setIsLoadingICal(true);
      const response = await calendarService.getICalToken();
      // Parse nested data.data.icalUrl as specified in requirements
      setIcalData(response.data);
    } catch (err) {
      console.error('Failed to fetch iCal URL:', err);
      setError({
        message: 'Failed to load calendar feed URL. Please refresh the page.'
      });
    } finally {
      setIsLoadingICal(false);
    }
  };

  const handleCopyUrl = async () => {
    if (icalData?.icalUrl) {
      try {
        await navigator.clipboard.writeText(icalData.icalUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handleRegenerateUrl = async () => {
    try {
      setIsLoadingICal(true);
      const response = await calendarService.regenerateICalToken();
      setIcalData(response.data);
      setShowInvalidationBanner(true);
      setShowRegenerateWarning(false);
      // Hide banner after 10 seconds
      setTimeout(() => setShowInvalidationBanner(false), 10000);
    } catch (err) {
      console.error('Failed to regenerate iCal URL:', err);
      setError({
        message: 'Failed to regenerate calendar feed URL. Please try again.'
      });
    } finally {
      setIsLoadingICal(false);
    }
  };

  const handleConnectGoogle = () => {
    // Set OAuth pending flag before redirecting
    sessionStorage.setItem('calendarOAuthPending', 'true');
    
    // Redirect to Google OAuth endpoint
    // This should be replaced with your actual OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/calendar/google/auth`;
  };

  const handleRetry = () => {
    setError(null);
    setState('default');
  };

  const handleGoBack = () => {
    navigate('/settings');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-stellar" />
          <p className="text-muted-foreground">Loading calendar settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Button>
        </div>
        <h1 className="text-3xl font-black text-text tracking-tight">Calendar Settings</h1>
        <p className="text-muted-foreground mt-1">
          Connect your calendar to sync sessions and manage your availability.
        </p>
      </div>

      {/* iCal Feed Section */}
      <div className="bg-background rounded-3xl border border-border shadow-sm p-6 md:p-8 mb-6">
        <h2 className="text-xl font-bold text-text mb-4">iCal Feed</h2>
        <p className="text-muted-foreground mb-6">
          Subscribe to your mentoring sessions in any calendar app that supports iCal feeds.
        </p>

        {isLoadingICal ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-stellar" />
            <span className="ml-2 text-muted-foreground">Loading calendar feed...</span>
          </div>
        ) : icalData?.icalUrl ? (
          <div className="space-y-4">
            {/* Invalidation Banner */}
            {showInvalidationBanner && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Feed URL Updated</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Your old feed URL is now invalid. Update your calendar app with the new URL below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* URL Display */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Calendar Feed URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={icalData.icalUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-mono"
                />
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use this URL to subscribe to your mentoring sessions in calendar apps like Google Calendar, Outlook, or Apple Calendar.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => window.open(icalData.icalUrl, '_blank')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open .ics File
              </Button>
              <Button
                onClick={() => setShowRegenerateWarning(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate URL
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Unable to load calendar feed URL. Please refresh the page to try again.
            </p>
          </div>
        )}

        {/* Regenerate Warning Dialog */}
        {showRegenerateWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-text">Regenerate Calendar Feed URL</h3>
              </div>
              
              <p className="text-muted-foreground mb-6">
                This will invalidate your current calendar subscription. Any apps using the old URL will stop syncing.
              </p>

              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setShowRegenerateWarning(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRegenerateUrl}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Card */}
      <div className="bg-background rounded-3xl border border-border shadow-sm p-6 md:p-8 mb-6">
        {state === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Calendar Connected!</h2>
            <p className="text-muted-foreground mb-6">
              Your Google Calendar has been successfully connected. Your sessions will now sync automatically.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleGoBack}>
                Done
              </Button>
              <Button variant="outline" onClick={() => navigate('/mentor/sessions')}>
                View Sessions
              </Button>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Connection Failed</h2>
            <p className="text-muted-foreground mb-6">
              {error?.message || 'An error occurred while connecting your calendar.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoBack}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {state === 'incomplete' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Connection Incomplete</h2>
            <p className="text-muted-foreground mb-6">
              {error?.message || 'Something went wrong connecting Google Calendar. Please try again.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoBack}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {state === 'default' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text mb-2">Connect Your Calendar</h2>
              <p className="text-muted-foreground mb-6">
                Sync your mentoring sessions with your calendar to avoid conflicts and stay organized.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-text mb-4">Available Providers</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-border rounded-xl p-4 hover:bg-surface transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text">Google Calendar</h4>
                        <p className="text-sm text-muted-foreground">Connect your Google account</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleConnectGoogle}
                    className="w-full"
                  >
                    Connect Google Calendar
                  </Button>
                </div>

                <div className="border border-border rounded-xl p-4 opacity-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text">Outlook Calendar</h4>
                        <p className="text-sm text-muted-foreground">Coming soon</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    disabled
                    className="w-full"
                  >
                    Connect Outlook Calendar
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Your mentoring sessions will be added to your calendar</li>
                <li>• Calendar conflicts will be automatically detected</li>
                <li>• You can manage availability directly from your calendar</li>
                <li>• Two-way sync keeps everything up to date</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSettings;
