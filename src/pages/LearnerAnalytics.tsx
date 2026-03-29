import React, { useEffect } from 'react';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import MetricCard from '../components/charts/MetricCard';
import RadarChart from '../components/charts/RadarChart';
import LearningReport from '../components/learner/LearningReport';
import { useDashboard } from '../hooks/useDashboard';
import { useLearnerAnalytics } from '../hooks/useLearnerAnalytics';
import { DashboardLayout } from '../layouts/DashboardLayout';

const LearnerAnalyticsContent: React.FC = () => {
  const analytics = useLearnerAnalytics();
  const { setRole, setLoading } = useDashboard();

  useEffect(() => {
    setRole('learner');
    setLoading(false);
  }, [setLoading, setRole]);

  return (
    <div className="space-y-8 p-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Learner Analytics</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Learning momentum, mentor impact, and ROI</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Measure where your time goes, who helps most, how quickly you are learning, and what your investment is returning.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Learning Time" value={`${analytics.summary.totalHours}h`} />
        <MetricCard title="Goal Completion" value={analytics.summary.completionRate} suffix="%" />
        <MetricCard title="Estimated ROI" value={analytics.summary.roiPercent} suffix="%" />
        <MetricCard title="Best Learning Day" value={analytics.summary.bestDay} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarChart
          title="Time Invested per Skill"
          description="Hours spent across the skills you are building"
          data={analytics.timeInvestedBySkill}
          series={[{ key: 'hours', name: 'Hours', color: '#2563eb' }]}
          horizontal
        />
        <LineChart
          title="Learning Velocity"
          description="Sessions completed per week"
          data={analytics.learningVelocity}
          series={[{ key: 'sessions', name: 'Sessions', color: '#0f766e' }]}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <RadarChart
          title="Skill Progression"
          description="Current confidence by core capability"
          data={analytics.skillProgression}
        />

        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Mentor Comparison</h2>
              <p className="text-sm text-slate-500">Ratings, completion volume, and breadth of skills learned.</p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Mentor fit
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {analytics.mentorComparison.map((mentor) => (
              <div key={mentor.mentor} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{mentor.mentor}</p>
                    <p className="text-xs text-slate-500">{mentor.skillsLearned} skills learned</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-right text-sm">
                    <div>
                      <p className="font-black text-slate-950">{mentor.ratingGiven}</p>
                      <p className="text-xs text-slate-500">Rating</p>
                    </div>
                    <div>
                      <p className="font-black text-slate-950">{mentor.sessionsCompleted}</p>
                      <p className="text-xs text-slate-500">Sessions</p>
                    </div>
                    <div>
                      <p className="font-black text-slate-950">{mentor.skillsLearned}</p>
                      <p className="text-xs text-slate-500">Skills</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <LineChart
          title="Goal Completion Rate"
          description="Completed goals compared with goals set over time"
          data={analytics.goalCompletionTrend}
          series={[
            { key: 'completed', name: 'Completed', color: '#16a34a' },
            { key: 'set', name: 'Set', color: '#94a3b8' },
            { key: 'completionRate', name: 'Completion %', color: '#2563eb' },
          ]}
          valueSuffix=""
        />

        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Learning Insight</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">{analytics.bestLearningDay}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This is your strongest completion day. Use it for your deepest work and schedule reflection or practice sessions close to it.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Investment summary</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-black text-slate-950">${analytics.investment.totalUsd.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Total invested</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950">${analytics.investment.estimatedSalaryLift.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Estimated salary lift</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950">{analytics.investment.roiPercent}%</p>
                <p className="text-xs text-slate-500">ROI estimate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LearningReport summary={analytics.summary} />
    </div>
  );
};

const LearnerAnalytics: React.FC = () => {
  return (
    <DashboardLayout>
      <LearnerAnalyticsContent />
    </DashboardLayout>
  );
};

export default LearnerAnalytics;
