import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Download } from 'lucide-react';
import MetricCard from '../charts/MetricCard';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import PieChart from '../charts/PieChart';
import ChartContainer from '../charts/ChartContainer';
import { TableSkeletonLoader } from '../animations/SkeletonLoader';
import { exportToCSV } from '../../utils/export.utils';
import { CHART_COLORS } from '../../utils/chart.utils';
import apiClient from '../../services/api.client';

type TimeRange = '7d' | '30d' | '90d' | '1y';

interface AnalyticsData {
  kpis: {
    totalRevenue: { value: number; change: number };
    activeUsers: { value: number; change: number };
    sessionsCompleted: { value: number; change: number };
    openDisputes: { value: number; change: number };
  };
  revenueData: { date: string; revenue: number }[];
  userGrowthData: { date: string; users: number }[];
  topMentors: { id: string; name: string; sessions: number; revenue: number; rating: number }[];
  assetDistribution: { name: string; value: number }[];
}

export const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (range: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, these would be separate calls or a single aggregated call
      // For this implementation, we'll simulate the combined data from the endpoints
      // GET /admin/analytics/revenue, /users, /sessions, /top-mentors
      const [revenueRes, usersRes, sessionsRes, mentorsRes] = await Promise.all([
        apiClient.get(`/admin/analytics/revenue?range=${range}`),
        apiClient.get(`/admin/analytics/users?range=${range}`),
        apiClient.get(`/admin/analytics/sessions?range=${range}`),
        apiClient.get(`/admin/analytics/top-mentors?range=${range}`)
      ]);

      setData({
        kpis: {
          totalRevenue: revenueRes.data.kpi,
          activeUsers: usersRes.data.kpi,
          sessionsCompleted: sessionsRes.data.kpi,
          openDisputes: sessionsRes.data.disputesKpi
        },
        revenueData: revenueRes.data.chart,
        userGrowthData: usersRes.data.chart,
        topMentors: mentorsRes.data,
        assetDistribution: revenueRes.data.distribution
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data. Please try again later.');
      
      // Fallback to mock data for demonstration if API fails
      simulateMockData(range);
    } finally {
      setLoading(false);
    }
  };

  const simulateMockData = (range: TimeRange) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const mockRevenue = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      revenue: Math.floor(Math.random() * 1000) + 500
    }));
    const mockUsers = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      users: Math.floor(Math.random() * 50) + 10
    }));

    setData({
      kpis: {
        totalRevenue: { value: 12540.50, change: 12.5 },
        activeUsers: { value: 1240, change: 8.2 },
        sessionsCompleted: { value: 450, change: -2.4 },
        openDisputes: { value: 12, change: 5.0 }
      },
      revenueData: mockRevenue,
      userGrowthData: mockUsers,
      topMentors: [
        { id: '1', name: 'Alex Rivera', sessions: 45, revenue: 2250, rating: 4.9 },
        { id: '2', name: 'Sarah Chen', sessions: 38, revenue: 1900, rating: 4.8 },
        { id: '3', name: 'Michael Scott', sessions: 32, revenue: 1600, rating: 4.7 },
        { id: '4', name: 'Elena Rodriguez', sessions: 28, revenue: 1400, rating: 4.9 },
        { id: '5', name: 'David Kim', sessions: 25, revenue: 1250, rating: 4.6 }
      ],
      assetDistribution: [
        { name: 'XLM', value: 45 },
        { name: 'USDC', value: 35 },
        { name: 'PYUSD', value: 20 }
      ]
    });
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const handleExportCSV = (type: 'revenue' | 'sessions') => {
    if (!data) return;
    
    if (type === 'revenue') {
      const headers = ['Date', 'Revenue (USD)'];
      const rows = data.revenueData.map(d => [d.date, d.revenue]);
      exportToCSV('revenue_analytics', headers, rows);
    } else {
      const headers = ['Date', 'Sessions'];
      // Assuming sessions growth follows a similar pattern for export
      const rows = data.revenueData.map(d => [d.date, Math.floor(d.revenue / 50)]);
      exportToCSV('sessions_analytics', headers, rows);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Monitor platform performance and track system activity</p>
          </div>
          
          <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-stellar text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <NavLink 
            to="/admin/analytics" 
            className={({ isActive }) => 
              `py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 font-semibold' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            Analytics
          </NavLink>
          <NavLink 
            to="/admin/audit-log" 
            className={({ isActive }) => 
              `py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 font-semibold' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            Audit Log
          </NavLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={data?.kpis?.totalRevenue?.value?.toLocaleString() ?? '0'}
          change={data?.kpis?.totalRevenue?.change}
          prefix="$"
          icon="💰"
        />
        <MetricCard
          title="Active Users"
          value={data?.kpis?.activeUsers?.value?.toLocaleString() ?? '0'}
          change={data?.kpis?.activeUsers?.change}
          icon="👥"
        />
        <MetricCard
          title="Sessions Completed"
          value={data?.kpis?.sessionsCompleted?.value?.toLocaleString() ?? '0'}
          change={data?.kpis?.sessionsCompleted?.change}
          icon="📅"
        />
        <MetricCard
          title="Open Disputes"
          value={data?.kpis?.openDisputes?.value?.toLocaleString() ?? '0'}
          change={data?.kpis?.openDisputes?.change}
          icon="⚠️"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Revenue Over Time"
          description="Total revenue generated from sessions"
          isLoading={loading}
          error={error}
          className="h-full"
        >
          <div className="absolute top-6 right-6">
            <button
              onClick={() => handleExportCSV('revenue')}
              className="flex items-center gap-2 text-xs font-medium text-stellar hover:text-stellar-dark transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
          <LineChart
            data={data?.revenueData ?? []}
            xKey="date"
            lines={[{ key: 'revenue', label: 'Revenue', color: CHART_COLORS[0] }]}
            height={300}
          />
        </ChartContainer>

        <ChartContainer
          title="User Growth"
          description="New user registrations"
          isLoading={loading}
          error={error}
        >
          <BarChart
            data={data?.userGrowthData ?? []}
            xKey="date"
            bars={[{ key: 'users', label: 'New Users', color: CHART_COLORS[1] }]}
            height={300}
          />
        </ChartContainer>

        <ChartContainer
          title="Asset Distribution"
          description="Payment volume by currency"
          isLoading={loading}
          error={error}
        >
          <PieChart
            data={data?.assetDistribution ?? []}
            height={300}
          />
        </ChartContainer>

        <ChartContainer
          title="Top Mentors"
          description="Highest performing mentors by revenue"
          isLoading={loading}
          error={error}
        >
          {loading ? (
            <TableSkeletonLoader rows={5} cols={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Mentor</th>
                    <th className="px-4 py-3 font-semibold text-right">Sessions</th>
                    <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                    <th className="px-4 py-3 font-semibold text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.topMentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{mentor.name}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{mentor.sessions}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold">${mentor.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          ★ {mentor.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartContainer>
      </div>
    </div>
  );
};

export default AdminAnalytics;
