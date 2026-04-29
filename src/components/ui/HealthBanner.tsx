import { useState } from 'react';
import { useHealthStatus, ComponentStatus } from '../../hooks/useHealthStatus';

const COMPONENT_MESSAGES: Record<string, string> = {
  horizon: 'Payment processing is temporarily unavailable.',
  db: 'Database access is temporarily unavailable.',
  redis: 'Some caching features may be affected.',
};

function getAffectedMessages(components: Record<string, ComponentStatus>): string[] {
  return Object.entries(components)
    .filter(([, status]) => status !== 'healthy')
    .map(([key]) => COMPONENT_MESSAGES[key] ?? `${key} is temporarily unavailable.`);
}

export default function HealthBanner() {
  const health = useHealthStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!health || dismissed) return null;

  const isUnhealthy = health.status === 'unhealthy';
  const affectedMessages = getAffectedMessages(health.components ?? {});

  const bannerClass = isUnhealthy
    ? 'bg-red-50 border-red-300 text-red-800'
    : 'bg-yellow-50 border-yellow-300 text-yellow-800';

  const headline = isUnhealthy
    ? "Some services are currently experiencing issues. We're working on it."
    : 'Some features may be temporarily unavailable.';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`w-full border-b px-4 py-3 text-sm ${bannerClass}`}
    >
      <div className="flex items-start justify-between gap-4 max-w-7xl mx-auto">
        <div>
          <p className="font-medium">{headline}</p>
          {affectedMessages.length > 0 && (
            <ul className="mt-1 list-disc list-inside space-y-0.5 opacity-90">
              {affectedMessages.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="shrink-0 opacity-60 hover:opacity-100 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
