import { useEffect, useMemo, useState } from 'react';
import type { GeoMapPoint } from '../components/charts/GeoDistributionMap';
import type { LiveFeedItem } from '../components/stats/LiveFeed';
import type { DataPoint, MultiSeriesDataPoint } from '../types/charts.types';

interface PlatformMetrics {
  totalSessions: number;
  totalMentors: number;
  totalLearners: number;
  totalUsdc: number;
}

interface PlatformSource {
  contractId: string;
  stellarExpertUrl: string;
  lastUpdated: string;
}

export interface PlatformStatsState {
  metrics: PlatformMetrics;
  growthTrend: MultiSeriesDataPoint[];
  topSkills: DataPoint[];
  geography: GeoMapPoint[];
  liveFeed: LiveFeedItem[];
  source: PlatformSource;
}

const INITIAL_GROWTH: MultiSeriesDataPoint[] = [
  { label: 'Oct', sessions: 620, mentors: 80, learners: 210, usdc: 42000 },
  { label: 'Nov', sessions: 710, mentors: 92, learners: 254, usdc: 49800 },
  { label: 'Dec', sessions: 840, mentors: 108, learners: 302, usdc: 56600 },
  { label: 'Jan', sessions: 930, mentors: 123, learners: 351, usdc: 64250 },
  { label: 'Feb', sessions: 1040, mentors: 136, learners: 402, usdc: 72100 },
  { label: 'Mar', sessions: 1185, mentors: 149, learners: 468, usdc: 81240 },
];

const TOP_SKILLS: DataPoint[] = [
  { label: 'React', value: 212 },
  { label: 'System Design', value: 184 },
  { label: 'Career Growth', value: 161 },
  { label: 'Stellar', value: 145 },
  { label: 'Product Strategy', value: 130 },
];

const GEOGRAPHY: GeoMapPoint[] = [
  { label: 'United States', value: 162, x: 24, y: 27, detail: 'Sessions in the last 30 days' },
  { label: 'Nigeria', value: 149, x: 53, y: 37, detail: 'Sessions in the last 30 days' },
  { label: 'United Kingdom', value: 94, x: 49, y: 21, detail: 'Sessions in the last 30 days' },
  { label: 'India', value: 137, x: 70, y: 34, detail: 'Sessions in the last 30 days' },
  { label: 'Kenya', value: 73, x: 55, y: 45, detail: 'Sessions in the last 30 days' },
];

const INITIAL_FEED: LiveFeedItem[] = [
  { id: 'feed-1', learnerAlias: 'Learner A.', mentorAlias: 'Mentor K.', skill: 'React performance', amountUsd: 140, timestamp: '2 minutes ago' },
  { id: 'feed-2', learnerAlias: 'Learner B.', mentorAlias: 'Mentor D.', skill: 'Stellar onboarding', amountUsd: 180, timestamp: '5 minutes ago' },
  { id: 'feed-3', learnerAlias: 'Learner C.', mentorAlias: 'Mentor S.', skill: 'System design', amountUsd: 220, timestamp: '8 minutes ago' },
  { id: 'feed-4', learnerAlias: 'Learner D.', mentorAlias: 'Mentor M.', skill: 'Career coaching', amountUsd: 95, timestamp: '14 minutes ago' },
  { id: 'feed-5', learnerAlias: 'Learner E.', mentorAlias: 'Mentor R.', skill: 'Product analytics', amountUsd: 165, timestamp: '19 minutes ago' },
];

export function usePlatformStats(): PlatformStatsState {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalSessions: 1185,
    totalMentors: 149,
    totalLearners: 468,
    totalUsdc: 81240,
  });
  const [growthTrend, setGrowthTrend] = useState(INITIAL_GROWTH);
  const [liveFeed, setLiveFeed] = useState(INITIAL_FEED);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMetrics((current) => ({
        totalSessions: current.totalSessions + 1,
        totalMentors: current.totalSessions % 9 === 0 ? current.totalMentors + 1 : current.totalMentors,
        totalLearners: current.totalSessions % 5 === 0 ? current.totalLearners + 1 : current.totalLearners,
        totalUsdc: current.totalUsdc + 145,
      }));

      setGrowthTrend((current) =>
        current.map((point, index) =>
          index === current.length - 1
            ? {
                ...point,
                sessions: Number(point.sessions) + 1,
                mentors: Number(point.mentors) + 0,
                learners: Number(point.learners) + 1,
                usdc: Number(point.usdc) + 145,
              }
            : point,
        ),
      );

      setLiveFeed((current) => {
        const nextItem: LiveFeedItem = {
          id: `feed-${Date.now()}`,
          learnerAlias: `Learner ${String.fromCharCode(65 + (Date.now() % 6))}.`,
          mentorAlias: `Mentor ${String.fromCharCode(75 + (Date.now() % 5))}.`,
          skill: TOP_SKILLS[Date.now() % TOP_SKILLS.length]?.label ?? 'Mentoring',
          amountUsd: 110 + (Date.now() % 4) * 35,
          timestamp: 'Just now',
        };

        return [nextItem, ...current.slice(0, 4)].map((item, index) => ({
          ...item,
          timestamp: index === 0 ? item.timestamp : `${index * 4 + 2} minutes ago`,
        }));
      });

      setLastUpdated(new Date().toISOString());
    }, 12_000);

    return () => window.clearInterval(interval);
  }, []);

  const source = useMemo(
    () => ({
      contractId: 'SC-80',
      stellarExpertUrl: 'https://stellar.expert/explorer/testnet/contract/SC-80',
      lastUpdated,
    }),
    [lastUpdated],
  );

  return {
    metrics,
    growthTrend,
    topSkills: TOP_SKILLS,
    geography: GEOGRAPHY,
    liveFeed,
    source,
  };
}

export default usePlatformStats;
