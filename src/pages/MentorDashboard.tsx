import MetricCard from '../components/charts/MetricCard';
import LineChart from '../components/charts/LineChart';
import SessionList from '../components/mentor/SessionList';

const EARNINGS_DATA = [
  { month: 'Jan', earnings: 1200 }, { month: 'Feb', earnings: 1800 },
  { month: 'Mar', earnings: 1500 }, { month: 'Apr', earnings: 2200 },
  { month: 'May', earnings: 2800 }, { month: 'Jun', earnings: 3100 },
];

export default function MentorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Earnings" value="3,100" prefix="$" change={10.7} icon="💰" />
        <MetricCard title="Sessions This Month" value={12} change={20} icon="📅" />
        <MetricCard title="Avg Rating" value="4.9" icon="⭐" />
        <MetricCard title="Total Students" value={48} change={8.3} icon="👥" />
      </div>
      <LineChart data={EARNINGS_DATA} lines={[{ key: 'earnings', label: 'Earnings ($)', color: '#6366f1' }]} xKey="month" title="Monthly Earnings" />
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
        <SessionList />
      </div>
    </div>
  );
}
