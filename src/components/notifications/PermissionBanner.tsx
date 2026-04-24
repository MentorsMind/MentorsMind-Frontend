import React from 'react';

export interface PermissionBannerProps {
  onEnable: () => void;
  onDismiss: () => void;
  isLoading: boolean;
  error: string | null;
}

export const PermissionBanner: React.FC<PermissionBannerProps> = ({
  onEnable,
  onDismiss,
  isLoading,
  error,
}) => {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-primary/20 bg-accent px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Icon + text */}
        <div className="flex items-start gap-3 sm:items-center">
          <span className="mt-0.5 text-primary sm:mt-0" aria-hidden="true">
            {/* Bell icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 shrink-0"
            >
              <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
              <path
                fillRule="evenodd"
                d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0l.002.1a2.25 2.25 0 1 1-4.5 0Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <p className="text-sm text-text">
            Stay up to date — enable push notifications to get session reminders and important updates.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
          <button
            onClick={onEnable}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && (
              <svg
                className="h-3.5 w-3.5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            Enable
          </button>
          <button
            onClick={onDismiss}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-muted-foreground transition hover:bg-surface"
          >
            Not now
          </button>
        </div>
      </div>

      {/* Inline error */}
      {error && (
        <div className="mx-auto mt-2 max-w-5xl pl-8 sm:pl-0">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PermissionBanner;
