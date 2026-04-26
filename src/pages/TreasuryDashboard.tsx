import React from 'react';
import { useTreasury } from '../hooks/useTreasury';
import MetricCard from '../components/charts/MetricCard';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import { LayoutDashboard, Wallet, TrendingUp, PieChart as PieChartIcon, ExternalLink, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const TreasuryDashboard: React.FC = () => {
  const { metrics, assets, allocations, history, lastUpdated, isLoading } = useTreasury();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const revenueData = history.map(h => ({
    label: h.label as string,
    revenue: h.revenue as number,
    expenses: h.expenses as number,
  }));

  const tvlHistory = history.map(h => ({
    label: h.label as string,
    tvl: h.tvl as number,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Treasury Dashboard</h2>
          <p className="text-gray-500 mt-1">On-chain visibility into the MentorMind DAO treasury and DAO-controlled funds.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
             Last Updated: {new Date(lastUpdated).toLocaleTimeString()}
           </span>
           <Link to="/governance" className="inline-flex items-center gap-2 bg-stellar text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-stellar/20 hover:bg-stellar-dark transition-all active:scale-95">
             <FileText className="w-4 h-4" />
             Governance
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Value Locked"
          value={formatCurrency(metrics.totalValueLocked)}
          change={12.5}
          changeLabel="vs last month"
          icon={<LayoutDashboard className="w-5 h-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="DAO Balance"
          value={formatCurrency(metrics.daoBalance)}
          change={8.2}
          changeLabel="vs last month"
          icon={<Wallet className="w-5 h-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(metrics.monthlyRevenue)}
          change={15.8}
          changeLabel="vs last month"
          icon={<TrendingUp className="w-5 h-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Monthly Expenses"
          value={formatCurrency(metrics.monthlyExpenses)}
          change={3.4}
          changeLabel="vs last month"
          icon={<ArrowDownRight className="w-5 h-5" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Total Value Locked (TVL)</h3>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                 <ArrowUpRight className="w-3 h-3" />
                 +14.2%
              </div>
           </div>
           <div className="w-full mt-4">
             <LineChart
                data={tvlHistory}
                series={[{ key: 'tvl', name: 'TVL', color: '#2563eb' }]}
                xAxisKey="label"
                valuePrefix="$"
             />
           </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Revenue & Expenses</h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold text-gray-500">Revenue</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="text-xs font-bold text-gray-500">Expenses</span>
                 </div>
              </div>
           </div>
           <div className="w-full mt-4">
             <BarChart
                data={revenueData}
                series={[
                   { key: 'revenue', name: 'Revenue', color: '#2563eb' },
                   { key: 'expenses', name: 'Expenses', color: '#f87171' }
                ]}
                xAxisKey="label"
             />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
               <Wallet className="w-5 h-5 text-stellar" />
               Asset Breakdown
            </h3>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-gray-50">
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Asset</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Balance</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Value (USD)</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">24h Change</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {assets.map((asset) => (
                        <tr key={asset.symbol} className="group hover:bg-gray-50 transition-colors">
                           <td className="py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: asset.color }}>
                                    {asset.symbol[0]}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900">{asset.name}</span>
                                    <span className="text-xs text-gray-500 font-medium">{asset.symbol}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4">
                              <span className="text-sm font-bold text-gray-900">{asset.amount.toLocaleString()}</span>
                           </td>
                           <td className="py-4">
                              <span className="text-sm font-bold text-gray-900">{formatCurrency(asset.valueUsd)}</span>
                           </td>
                           <td className="py-4">
                              <div className={`inline-flex items-center gap-1 text-xs font-bold ${asset.change24h >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                 {asset.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                 {Math.abs(asset.change24h)}%
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
               <button className="text-sm font-bold text-stellar hover:underline flex items-center gap-1.5 transition-all">
                  View full history on StellarExpert
                  <ExternalLink className="w-3 h-3" />
               </button>
            </div>
         </div>

         <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
               <PieChartIcon className="w-5 h-5 text-stellar" />
               Budget Allocation
            </h3>
            <div className="w-full">
               <PieChart
                  data={allocations.map(a => ({ label: a.category, value: a.percentage, color: a.color }))}
               />
            </div>
            <div className="mt-8 space-y-4">
               {allocations.map((alloc) => (
                  <div key={alloc.category} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: alloc.color }} />
                        <span className="text-sm font-bold text-gray-600">{alloc.category}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400">{formatCurrency(alloc.amount)}</span>
                        <span className="text-sm font-black text-gray-900">{alloc.percentage}%</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default TreasuryDashboard;
