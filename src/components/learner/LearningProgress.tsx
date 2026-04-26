interface ProgressItem { label: string; current: number; target: number; color?: string; }

interface LearningProgressProps { items?: ProgressItem[]; }

const DEFAULT: ProgressItem[] = [
  { label: 'React Fundamentals', current: 8, target: 10, color: 'bg-indigo-500' },
  { label: 'TypeScript', current: 5, target: 10, color: 'bg-purple-500' },
  { label: 'Node.js Backend', current: 3, target: 10, color: 'bg-cyan-500' },
];

export default function LearningProgress({ items = DEFAULT }: LearningProgressProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Skill Progression Over Time</h2>
        <p className="text-sm text-gray-500">Progress dashboard with momentum signals</p>
      </div>

      <div className="space-y-4">
      {items.map(item => {
        const pct = Math.round((item.current / item.target) * 100);
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-500">{item.current}/{item.target} sessions</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${item.color ?? 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-gray-400">{pct}% complete</p>
          </div>
        );
      })}
    </div>

    <div className="pt-4 border-t border-gray-100">
      <h3 className="text-sm font-bold text-gray-900">Milestone Celebration</h3>
      <p className="text-xs text-gray-400 mt-1">Celebrate your achievements and growth.</p>
    </div>
  </div>
);
}
