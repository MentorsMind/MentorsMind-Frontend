import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format, subDays } from 'date-fns';
import { useEarningsData } from '../hooks/useEarningsData';
import { AreaChartComponent } from '../components/charts/AreaChart';
import { EarningsChart } from '../components/charts/EarningsChart';
import { exportToCSV } from '../utils/export.utils';
import { formatCurrency } from '../utils/export.utils';

const MentorAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: subDays(new Date(), 180), // 6 months ago
    end: new Date(),
  });

  const { data, loading, exportCSV } = useEarningsData(dateRange);

  const handleExport = () => {
    exportToCSV('mentor_earnings', 
      ['Date', 'Learner', 'Topic', 'Duration (min)', 'Gross', 'Platform Fee', 'Net', 'Asset'],
      [] // Can integrate actual data here
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse bg-white rounded-3xl p-12 shadow-xl">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const changeClass = data.metrics.periodChange >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
              Earnings Analytics
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Track your revenue, sessions, and performance over time
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
              <DatePicker
                selectsRange
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={(update: [Date | null, Date | null]) => {
                  setDateRange({
                    start: update[0] || subDays(new Date(), 180),
                    end: update[1] || new Date(),
                  });
                }}
                dateFormat="MMM d, yyyy"
                className="text-sm font-medium text-gray-900 focus:outline-none"
                wrapperClassName="w-full"
              />
            </div>
            <button
              onClick={handleExport}
              className="bg-stellar hover:bg-stellar/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Total Sessions</div>
            <div className="text-2xl font-black text-gray-900">{data.metrics.totalSessions}</div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Avg Duration</div>
            <div className="text-2xl font-black text-gray-900">{data.metrics.avgDuration} min</div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Platform Fees</div>
            <div className="text-2xl font-black text-gray-900">${data.metrics.platformFees.toFixed(0)}</div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
              Period Change
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${changeClass}`}>
                {data.metrics.periodChange >= 0 ? '+' : ''}{data.metrics.periodChange.toFixed(0)}%
              </span>
            </div>
            <div className="text-2xl font-black text-gray-900">
              ${data.metrics.currentPeriodTotal.toFixed(0)}
              <span className="text-sm text-gray-500 font-normal ml-1">
                vs ${data.metrics.previousPeriodTotal.toFixed(0)} prev
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          <AreaChartComponent 
            data={data.monthlyEarnings} 
            title="Monthly Earnings with Asset Breakdown" 
          />
          <EarningsChart 
            weeklySessions={data.weeklySessions}
            topLearners={data.topLearners}
            skillBreakdown={data.skillBreakdown}
          />
        </div>
      </div>
    </div>
  );
};

export default MentorAnalytics;

