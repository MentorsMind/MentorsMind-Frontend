import React from 'react';
import type { LearningAnalytics as AnalyticsType } from '../../types/session.types';
import MetricCard from '../charts/MetricCard';
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';

interface LearningAnalyticsProps {
  analytics: AnalyticsType;
}

const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Completion Rate"
          value={Math.round(analytics.completionRate)}
          suffix="%"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <MetricCard
          title="Total Spent"
          value={analytics.totalSpent}
          prefix="$"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <MetricCard
          title="Learning Velocity"
          value={analytics.learningVelocity.weeklyAverage}
          suffix=" sessions/week"
          change={analytics.learningVelocity.monthlyTrend}
          changeLabel="this month"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Skill Development</h3>
          <div className="space-y-3">
            {analytics.skillProgress.map((skill) => (
              <div key={skill.skill}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                  <span className="text-xs text-gray-500">{skill.sessionsCount} sessions</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stellar rounded-full transition-all"
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mentor Interactions</h3>
          <div className="space-y-3">
            {analytics.mentorInteractions.map((mentor) => (
              <div key={mentor.mentorId} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">{mentor.mentorName}</div>
                  <div className="text-xs text-gray-500">{mentor.sessionsCount} sessions • {Math.round(mentor.totalTime / 60)}h</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-bold">{mentor.averageRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Session Frequency"
          data={{
            labels: analytics.sessionFrequency.labels,
            datasets: [{
              label: 'Sessions',
              data: analytics.sessionFrequency.values,
              backgroundColor: '#6366f1',
            }],
          }}
        />

        <LineChart
          title="Spending Trend"
          data={{
            labels: analytics.spendingAnalytics.monthlyTrend.map(m => m.month),
            datasets: [{
              label: 'Amount (XLM)',
              data: analytics.spendingAnalytics.monthlyTrend.map(m => m.amount),
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            }],
          }}
        />
      </div>
    </div>
  );
};

export default LearningAnalytics;
