import React from 'react';
import MetricCard from '../charts/MetricCard';
import { PoolStats as PoolStatsType } from '../../hooks/useLendingPool';

interface PoolStatsProps {
  stats: PoolStatsType;
}

const PoolStats: React.FC<PoolStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <MetricCard 
        title="Total Liquidity" 
        value={stats.totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
        prefix="$" 
      />
      <MetricCard 
        title="Utilization Rate" 
        value={Math.round(stats.utilizationRate * 100)} 
        suffix="%" 
      />
      <MetricCard 
        title="Current APY" 
        value={stats.currentAPY} 
        suffix="%" 
      />
    </div>
  );
};

export default PoolStats;
