import React from 'react';

export interface DeniedTooltipProps {
  onDismiss: () => void;
}

function detectBrowserName(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Unknown';
}

interface BrowserInstructions {
  browser: 'Chrome' | 'Firefox' | 'Safari';
  steps: string;
}

const BROWSER_INSTRUCTIONS: BrowserInstructions[] = [
  {
    browser: 'Chrome',
    steps:
      'Click the lock icon in the address bar → Site settings → Notifications → Allow',
  },
  {
    browser: 'Firefox',
    steps:
      'Click the lock icon in the address bar → Connection secure → More information → Permissions → Receive notifications → Allow',
  },
  {
    browser: 'Safari',
    steps:
      'Go to Safari → Settings for this website → Notifications → Allow',
  },
];

export const DeniedTooltip: React.FC<DeniedTooltipProps> = ({ onDismiss }) => {
  const detectedBrowser = detectBrowserName(navigator.userAgent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="denied-tooltip-title"
    >
      <div
        className="relative bg-background rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-text hover:bg-surface rounded-full transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <div>
            <h2 id="denied-tooltip-title" className="text-base font-semibold text-text">
              Notifications blocked
            </h2>
            <p className="text-sm text-muted-foreground">
              Re-enable them in your browser settings.
            </p>
          </div>
        </div>

        {/* Browser instructions */}
        <div className="space-y-3">
          {BROWSER_INSTRUCTIONS.map(({ browser, steps }) => {
            const isActive = detectedBrowser === browser;
            return (
              <div
                key={browser}
                className={`rounded-xl border px-4 py-3 transition-colors ${
                  isActive
                    ? 'border-primary bg-accent'
                    : 'border-border bg-surface opacity-50'
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {browser}
                  {isActive && (
                    <span className="ml-2 normal-case font-medium text-primary/80">
                      (your browser)
                    </span>
                  )}
                </p>
                <p className={`text-sm ${isActive ? 'text-text' : 'text-muted-foreground'}`}>
                  {steps}
                </p>
              </div>
            );
          })}
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="mt-5 w-full rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-surface"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default DeniedTooltip;
