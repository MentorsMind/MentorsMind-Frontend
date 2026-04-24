import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import DelegationPanel from '../components/governance/DelegationPanel';

const Governance = () => {
  const proposals = [
    { id: '1', title: 'Implement Decentralized Identity Verification', status: 'Queued', votes: '1.7M VP' },
    { id: '2', title: 'Update Mentor Reward Multiplier', status: 'Active', votes: '850K VP' },
    { id: '3', title: 'DAO Treasury Allocation for Q2 2024', status: 'Passed', votes: '2.1M VP' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold mb-1">DAO Governance</h2>
        <p className="text-gray-500">Manage your voting delegation and track governance participation in one place.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DelegationPanel />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Active Proposals</h3>
              <button className="text-sm font-bold text-stellar hover:underline">View All</button>
            </div>
            
            <div className="space-y-3">
              {proposals.map((proposal) => (
                <Link 
                  key={proposal.id} 
                  to={`/governance/proposals/${proposal.id}`}
                  className="group flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-all hover:border-stellar/30 hover:bg-stellar/5 hover:shadow-md active:scale-[0.98]"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Proposal #{proposal.id}</span>
                    <span className="text-base font-bold text-gray-900 group-hover:text-stellar">{proposal.title}</span>
                    <div className="mt-2 flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        proposal.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                        proposal.status === 'Passed' ? 'bg-green-100 text-green-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {proposal.status === 'Active' ? <Clock className="mr-1 h-3 w-3" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {proposal.status}
                      </span>
                      <span className="text-xs text-gray-500">{proposal.votes}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-stellar" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Governance status</h3>
            <p className="text-gray-500">Your active delegation and voting power are synchronized with the DAO state. When you delegate, a Freighter signature is required to confirm identity and sign the transaction.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Governance;
