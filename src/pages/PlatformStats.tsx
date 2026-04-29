import React from 'react';
import BarChart from '../components/charts/BarChart';
import GeoDistributionMap from '../components/charts/GeoDistributionMap';
import LineChart from '../components/charts/LineChart';
import LiveFeed from '../components/stats/LiveFeed';
import MetricCounter from '../components/stats/MetricCounter';
import { usePlatformStats } from '../hooks/usePlatformStats';

const PlatformStats: React.FC = () => {
  const stats = usePlatformStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2.5rem] bg-slate-950 px-8 py-10 text-white shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Public Transparency</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Platform-wide public stats</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
                Real-time transparency from the health dashboard contract, with monthly growth, on-chain activity, and recent anonymized session flow.
              </p>
            </div>

            <a
              href={stats.source.stellarExpertUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              Powered by Stellar • {stats.source.contractId}
            </a>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCounter label="Total sessions" value={stats.metrics.totalSessions} />
          <MetricCounter label="Total mentors" value={stats.metrics.totalMentors} />
          <MetricCounter label="Total learners" value={stats.metrics.totalLearners} />
          <MetricCounter label="USDC transacted" value={stats.metrics.totalUsdc} prefix="$" />
        </section>

        <LineChart
          title="Monthly Growth"
          data={stats.growthTrend as any}
          series={[
            { key: 'sessions', name: 'Sessions', color: '#2563eb' },
            { key: 'mentors', name: 'Mentors', color: '#0f766e' },
            { key: 'learners', name: 'Learners', color: '#7c3aed' },
            { key: 'usdc', name: 'USDC', color: '#ea580c' },
          ]}
        />

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <BarChart
            title="Top Skills by Session Volume"
            description="Skills with the highest confirmed session throughput"
            data={stats.topSkills.map((item) => ({ label: item.label, sessions: item.value }))}
            series={[{ key: 'sessions', name: 'Sessions', color: '#2563eb' }]}
          />
          <LiveFeed items={stats.liveFeed} />
        </section>

        <GeoDistributionMap
          title="Geographic Distribution"
          description="Recent session activity where region-level data is available"
          data={stats.geography}
        />
      </div>
    </div>
  );
};

export default PlatformStats;
