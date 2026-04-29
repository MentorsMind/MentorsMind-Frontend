import { useState, useEffect } from 'react';
import MetricCard from '../components/charts/MetricCard';
import LearningProgress from '../components/learner/LearningProgress';
import GoalSetting from '../components/learner/GoalSetting';
import SessionList from '../components/mentor/SessionList';
import { SkeletonCard } from '../components/animations/SkeletonLoader';
import { useMinimumLoading } from '../hooks/useMinimumLoading';

export default function LearnerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const showSkeleton = useMinimumLoading(isLoading, 300);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
      
      {showSkeleton ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Sessions Completed" value={16} change={25} icon="✅" />
          <MetricCard title="Hours Learned" value={24} change={12} icon="⏱️" />
          <MetricCard title="Goals Achieved" value={3} icon="🎯" />
          <MetricCard title="Avg Session Rating" value="4.8" icon="⭐" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Learning Progress</h2>
          {showSkeleton ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <LearningProgress />
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">My Goals</h2>
          {showSkeleton ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <GoalSetting />
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
        {showSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => <SkeletonCard key={i} variant="booking" />)}
          </div>
        ) : (
          <SessionList />
        )}
      </div>

      {/* Post-session review prompt — auto-appears when a completed session has no review */}
      {pendingSession && (
        <PostSessionReview
          session={pendingSession}
          submitted={submitted}
          updatedRating={updatedRating}
          onSubmit={submitReview}
          onDismiss={dismissForNow}
          onClose={close}
        />
      )}
    </div>
  );
}
