import { useEffect, useState } from 'react';
import axios from 'axios';

export type ComponentStatus = 'healthy' | 'unhealthy' | 'degraded';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  components: Record<string, ComponentStatus>;
}

export function useHealthStatus(): HealthStatus | null {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    axios
      .get<HealthStatus>('/api/health/ready', { validateStatus: () => true })
      .then((res) => {
        const data = res.data;
        if (data?.status && data.status !== 'healthy') {
          setHealth(data);
        }
      })
      .catch(() => {
        // Network failure — don't show banner; monitoring handles this
      });
  }, []);

  return health;
}
