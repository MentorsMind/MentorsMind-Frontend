import React, { useState } from 'react';
import { useMentorDashboard } from '../hooks/useMentorDashboard';
import UpcomingSessions from '../components/mentor/UpcomingSessions';
import EarningsOverview from '../components/mentor/EarningsOverview';
import PerformanceMetrics from '../components/mentor/PerformanceMetrics';
import RecentReviews from '../components/mentor/RecentReviews';
import ActivityFeed from '../components/mentor/ActivityFeed';

const MentorDashboard: React.FC = () => {
  const {
    data,
    confirmSession,
    cancelSession,
    rescheduleSession,
    exportEarningsCSV,
  } = useMentorDashboard();

  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'earnings'>('overview');
  const [isAvailable, setIsAvailable] = useState(true);

  const handleReschedule = (id: string) => {
    // Quick action: reschedule to 48 hours from now
    const newTime = new Date(Date.now() + 172800000).toISOString();
    rescheduleSession(id, newTime);
    alert(`Session rescheduled to ${new Date(newTime).toLocaleString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-wrap justify-between items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Hello, <span className="text-stellar">Mentor</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">
            Here's what's happening with your sessions today.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">Mar</span>
                <span className="text-lg font-black text-gray-900">23</span>
            </div>
            <div className="pr-4">
                <div className="text-xs font-bold text-gray-400 uppercase">Availability</div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs font-bold text-gray-900">{isAvailable ? 'Active Now' : 'Offline'}</span>
                </div>
            </div>
            <button 
                onClick={() => setIsAvailable(!isAvailable)}
                className={`${isAvailable ? 'bg-stellar' : 'bg-gray-200'} text-white p-2 rounded-lg hover:opacity-80 transition-all`}
                title="Toggle Availability"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-stellar/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />
            <div className="relative">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Status</span>
                    <span className="text-xs font-black text-stellar">{data.profileCompletion}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-50 rounded-full mb-3">
                    <div className="h-full bg-stellar rounded-full" style={{ width: `${data.profileCompletion}%` }} />
                </div>
                <button className="text-[10px] font-bold text-gray-400 hover:text-stellar underline underline-offset-4">Complete Your Bio</button>
            </div>
          </div>

          <PerformanceMetrics metrics={data.performance} />
          <RecentReviews reviews={data.recentReviews} />
          
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl shadow-gray-200">
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-stellar" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                      <div className="text-xl font-bold">{data.pendingMessagesCount}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Messages</div>
                  </div>
              </div>
              <button 
                onClick={() => alert('Opening Inbox...')}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
              >
                Go to Inbox
              </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2 overflow-x-auto no-scrollbar">
            {(['overview', 'sessions', 'earnings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-stellar text-white shadow-lg shadow-stellar/20' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
                 <UpcomingSessions 
                    sessions={data.upcomingSessions} 
                    onConfirm={confirmSession}
                    onCancel={cancelSession}
                    onReschedule={handleReschedule}
                />
            </div>
            
            <EarningsOverview earnings={data.earnings} onExport={exportEarningsCSV} />
            <ActivityFeed activities={data.activities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
