import React, { useEffect } from 'react';
import { Networks, Transaction, TransactionBuilder } from '@stellar/stellar-sdk';
import { useTreasuryDashboard } from '../hooks/useTreasuryDashboard';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { Widget } from '../components/dashboard/Widget';

const TransactionHistory: React.FC<{ transactions: any[] }> = ({ transactions }) => (
  <div className="space-y-4">
    {transactions.map((tx) => (
      <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            tx.type === 'inbound' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {tx.type === 'inbound' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{tx.memo || 'Internal Transfer'}</div>
            <div className="text-xs font-medium text-gray-500">{new Date(tx.timestamp).toLocaleString()}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-black ${tx.type === 'inbound' ? 'text-green-600' : 'text-blue-600'}`}>
            {tx.type === 'inbound' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.asset}
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase">{tx.status}</div>
        </div>
      </div>
    ))}
  </div>
);

const TreasuryDashboardContent: React.FC = () => {
  const { data, isLoading } = useTreasuryDashboard();
  const { setRole, setLoading } = useDashboard();

  useEffect(() => {
    setRole('admin');
    setLoading(isLoading);
  }, [setRole, setLoading, isLoading]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Treasury Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Overview of the MentorsMind community treasury and assets.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm transition-all hover:shadow-md">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Value</div>
            <div className="text-xl font-black text-gray-900 dark:text-white">
              ${data.totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <DashboardGrid>
        <Widget config={{ id: 'assets', title: 'Treasury Assets', type: 'treasury', size: 'large', order: 1, visible: true }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Asset</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Balance</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">USD Value</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">24h Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.assets.map((asset) => (
                  <tr key={asset.code} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-xs">
                          {asset.code.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{asset.code}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-600 dark:text-gray-300">
                      {asset.balance.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                      ${asset.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${asset.change24h >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Widget>

        <Widget config={{ id: 'allocation', title: 'Asset Allocation', type: 'treasury', size: 'small', order: 2, visible: true }}>
          <div className="h-48 flex items-center justify-center relative">
             <div className="w-32 h-32 rounded-full border-[12px] border-gray-100 dark:border-gray-800 flex items-center justify-center">
                <span className="text-xl font-black text-gray-900 dark:text-white">100%</span>
             </div>
             {/* Simple visual representation for now */}
          </div>
          <div className="mt-6 space-y-3">
            {data.allocation.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </Widget>

        <Widget config={{ id: 'transactions', title: 'Recent Transactions', type: 'treasury', size: 'large', order: 3, visible: true }}>
          <div className="space-y-4">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === 'inbound' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {tx.type === 'inbound' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{tx.memo || 'Internal Transfer'}</div>
                    <div className="text-xs font-medium text-gray-500">{new Date(tx.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-black ${tx.type === 'inbound' ? 'text-green-600' : 'text-blue-600'}`}>
                    {tx.type === 'inbound' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.asset}
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget config={{ id: 'flow', title: 'Revenue vs Expenses', type: 'treasury', size: 'small', order: 4, visible: true }}>
          <div className="space-y-6">
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-500">Weekly Revenue</span>
                  <span className="font-bold text-green-600">+$4,050.00</span>
               </div>
               <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '75%' }} />
               </div>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-500">Weekly Expenses</span>
                  <span className="font-bold text-blue-600">-$1,340.00</span>
               </div>
               <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '35%' }} />
               </div>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-900 dark:text-white">Net Cash Flow</span>
                  <span className="text-green-600">+$2,710.00</span>
               </div>
            </div>
          </div>
        </Widget>
      </DashboardGrid>
    </div>
  );
};

const TreasuryDashboard: React.FC = () => (
  <DashboardLayout>
    <TreasuryDashboardContent />
  </DashboardLayout>
);

export default TreasuryDashboard;
