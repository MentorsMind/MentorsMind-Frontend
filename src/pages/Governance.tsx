import React from 'react';
import DelegationPanel from '../components/governance/DelegationPanel';

const Governance = () => {
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

        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Governance status</h3>
            <p className="text-gray-500">Your active delegation and voting power are synchronized with the DAO state. When you delegate, a Freighter signature is required to confirm identity and sign the transaction.</p>
          </section>
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">How it works</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Delegate your own vote to another address to simplify governance participation.</li>
              <li>You retain received voting power from others who delegate to you.</li>
              <li>If you are already delegating to someone else, your own voting power is temporarily re-routed.</li>
              <li>To avoid delegation loops, the UI warns when choosing an address already in delegation chains.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Governance;
