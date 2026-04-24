import React, { useEffect, useMemo, useState } from 'react';
import CohortChart from '../components/charts/CohortChart';
import ForecastChart from '../components/charts/ForecastChart';
import GeoDistributionMap from '../components/charts/GeoDistributionMap';
import HeatmapChart from '../components/charts/HeatmapChart';
import LineChart from '../components/charts/LineChart';
import MetricCard from '../components/charts/MetricCard';
import PieChart from '../components/charts/PieChart';
import { useDashboard } from '../hooks/useDashboard';
import { useMentorAnalytics } from '../hooks/useMentorAnalytics';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { downloadPdfReport } from '../utils/pdf-export.utils';

type RangePreset = '7d' | '30d' | '90d' | '1y' | 'custom';

function offsetDate(days: number) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

const presetConfig: Record<Exclude<RangePreset, 'custom'>, number> = {
  '7d': -7,
  '30d': -30,
  '90d': -90,
  '1y': -365,
};

const MentorAnalyticsContent: React.FC = () => {
  const { setRole, setLoading } = useDashboard();
  const [preset, setPreset] = useState<RangePreset>('30d');
  const [customStart, setCustomStart] = useState(formatDateInput(offsetDate(-45)));
  const [customEnd, setCustomEnd] = useState(formatDateInput(new Date()));

  useEffect(() => {
    setRole('mentor');
    setLoading(false);
  }, [setLoading, setRole]);

  const range = useMemo(() => {
    if (preset === 'custom') {
      return {
        start: new Date(`${customStart}T00:00:00`),
        end: new Date(`${customEnd}T23:59:59`),
      };
    }

    return {
      start: offsetDate(presetConfig[preset]),
      end: new Date(),
    };
  }, [customEnd, customStart, preset]);

  const analytics = useMentorAnalytics(range);

  const handleExportPdf = () => {
    downloadPdfReport({
      filename: 'mentor-analytics-report',
      title: 'Mentor Analytics Deep Dive',
      subtitle: `Range: ${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`,
      sections: analytics.pdfSections,
    });
  };

  return (
    <div className="space-y-8 p-6">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Mentor Analytics</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Deep dive into learner retention and revenue quality</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Track cohort behavior, demand shifts, session completion quality, and a 30-day revenue outlook from recurring bookings.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(['7d', '30d', '90d', '1y', 'custom'] as RangePreset[]).map((option) => (
              <button
                key={option}
                onClick={() => setPreset(option)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  preset === option
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Start</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">End</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
          )}

          <button
            onClick={handleExportPdf}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Export PDF report
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Revenue" value={`$${analytics.summary.totalRevenue.toLocaleString()}`} />
        <MetricCard title="Completed Sessions" value={analytics.summary.completedSessions} />
        <MetricCard title="Active Learners" value={analytics.summary.activeLearners} />
        <MetricCard title="Average Review" value={analytics.summary.averageReview} suffix="/5" />
        <MetricCard title="30d Forecast" value={`$${analytics.summary.forecastedRevenue.toLocaleString()}`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <CohortChart
          title="Cohort Retention"
          description="% of learners who return for later sessions"
          data={analytics.cohortRetention}
        />
        <PieChart
          title="Revenue by Skill / Topic"
          description="Top earning topics in the selected range"
          data={analytics.revenueBySkill}
          donut
          valuePrefix="$"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <HeatmapChart
          title="Peak Booking Hours"
          description="Day-by-hour booking density"
          days={analytics.days}
          hours={analytics.hours}
          data={analytics.peakBookingHours}
        />
        <GeoDistributionMap
          title="Learner Geography"
          description="Where your repeat demand is strongest"
          data={analytics.geography}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ForecastChart
          title="Revenue Forecast"
          description="Next 30 days from recurring booking patterns"
          data={analytics.revenueForecast}
        />
        <LineChart
          title="Session Completion Rate Trend"
          description="Completed sessions as a percentage of booked sessions"
          data={analytics.completionTrend}
          series={[{ key: 'completionRate', name: 'Completion rate', color: '#16a34a' }]}
          valueSuffix="%"
        />
      </section>

      <LineChart
        title="Average Review Score Trend"
        description="Review score movement over time"
        data={analytics.reviewTrend}
        series={[{ key: 'averageScore', name: 'Average review', color: '#2563eb' }]}
      />
    </div>
  );
};

const MentorAnalytics: React.FC = () => {
  return (
    <DashboardLayout>
      <MentorAnalyticsContent />
    </DashboardLayout>
  );
};

export default MentorAnalytics;
