import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useDashboard } from '../hooks/useDashboard';
import { useStreak } from '../hooks/useStreak';

const LeaderboardContent: React.FC = () => {
  const { setRole, setLoading } = useDashboard();
  const { leaderboardTop10 } = useStreak();

  useEffect(() => {
    setRole('learner');
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [setRole, setLoading]);

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
            <Trophy className="w-6 h-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Leaderboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Top 10 learners by current week streak</p>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Back to dashboard
        </Link>
      </header>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
              <th className="px-4 py-3 font-bold text-gray-600 dark:text-gray-300">Rank</th>
              <th className="px-4 py-3 font-bold text-gray-600 dark:text-gray-300">Learner</th>
              <th className="px-4 py-3 font-bold text-gray-600 dark:text-gray-300 text-right">Week streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardTop10.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                  row.isCurrentUser ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''
                }`}
              >
                <td className="px-4 py-3 font-bold tabular-nums text-gray-900 dark:text-white">{row.rank}</td>
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                  {row.name}
                  {row.isCurrentUser ? (
                    <span className="ml-2 text-xs font-bold uppercase text-blue-600 dark:text-blue-400">You</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {row.streakWeeks} wk
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Leaderboard: React.FC = () => (
  <DashboardLayout>
    <LeaderboardContent />
  </DashboardLayout>
);

export default Leaderboard;
