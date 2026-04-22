import MetricCard from '../components/charts/MetricCard';
import LearningProgress from '../components/learner/LearningProgress';
import GoalSetting from '../components/learner/GoalSetting';
import SessionList from '../components/mentor/SessionList';

export default function LearnerDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Sessions Completed" value={16} change={25} icon="✅" />
        <MetricCard title="Hours Learned" value={24} change={12} icon="⏱️" />
        <MetricCard title="Goals Achieved" value={3} icon="🎯" />
        <MetricCard title="Avg Session Rating" value="4.8" icon="⭐" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Learning Progress</h2>
          <LearningProgress />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">My Goals</h2>
          <GoalSetting />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
        <SessionList />
      </div>
    </div>
  );
}
