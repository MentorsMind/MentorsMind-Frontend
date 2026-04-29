import { useState } from 'react';
import { useHealthStatus, isHealthy, ComponentStatus } from '../../hooks/useHealthStatus';

const COMPONENT_MESSAGES: Record<string, string> = {
  horizon: 'Payment processing is temporarily unavailable.',
  db: 'Database access is temporarily unavailable.',
  redis: 'Some caching features may be affected.',
};

const STATUS_COLORS: Record<ComponentStatus, string> = {
  healthy: 'text-green-700',
  degraded: 'text-amber-700',
  unhealthy: 'text-red-700',
};

export default function HealthBanner() {
  const health = useHealthStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!health || dismissed) return null;

  const unhealthy = health.status === 'unhealthy';
  const affected = Object.entries(health.components ?? {}).filter(([, s]) => !isHealthy(s));

  const bannerClass = unhealthy
    ? 'bg-red-50 border-red-300 text-red-800'
    : 'bg-yellow-50 border-yellow-300 text-yellow-800';

  const headline = unhealthy
    ? "Some services are currently experiencing issues. We're working on it."
    : 'Some features may be temporarily unavailable.';

  return (
    <div role="alert" aria-live="polite" className={`w-full border-b px-4 py-3 text-sm ${bannerClass}`}>
      <div className="flex items-start justify-between gap-4 max-w-7xl mx-auto">
        <div>
          <p className="font-medium">{headline}</p>
          {affected.length > 0 && (
            <ul className="mt-1 list-disc list-inside space-y-0.5 opacity-90">
              {affected.map(([key, status]) => (
                <li key={key} className={STATUS_COLORS[status as ComponentStatus] ?? STATUS_COLORS.unhealthy}>
                  {COMPONENT_MESSAGES[key] ?? `${key} is temporarily unavailable.`}
                  {' '}<span className="opacity-70">({status})</span>
                </li>
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
