import React from 'react';
import MetricCard from '../charts/MetricCard';
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';
import type { LearningProgressData } from '../../types';

interface ProgressDashboardProps {
  progress: LearningProgressData;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ progress }) => {
  const chartData = progress.skillProgression;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title="Sessions Completed" value={progress.sessionsCompleted} />
        <MetricCard title="Time Invested" value={progress.timeInvestedHours} suffix="h" />
        <MetricCard title="Learning Streak" value={progress.learningStreakDays} suffix=" days" />
        <MetricCard
          title="Goal Completion"
          value={progress.goalCompletionRate}
          suffix="%"
          change={progress.peerComparison}
          changeLabel="vs similar learners"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LineChart
          title="Skill Progression Over Time"
          description="Track how your core skills have grown across recent learning cycles."
          data={chartData as any}
          series={[
            { key: 'stellar', name: 'Stellar' },
            { key: 'soroban', name: 'Soroban' },
            { key: 'product', name: 'Product Thinking' },
          ]}
          zoomable
        />

        <BarChart
          title="Goal Completion Metrics"
          description="See how far along each active learning goal is."
          data={progress.goals.map((goal) => ({
            label: goal.title,
            completed: goal.completedSteps,
            remaining: goal.totalSteps - goal.completedSteps,
          })) as any}
          series={[
            { key: 'completed', name: 'Completed' },
            { key: 'remaining', name: 'Remaining' },
          ]}
          stacked
          horizontal
        />
      </div>
    </div>
  );
};

export default ProgressDashboard;
