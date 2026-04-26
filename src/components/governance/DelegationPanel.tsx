import React from 'react';
import { useDelegation } from '../../hooks/useDelegation';

const formatTrim = (value: string | null) => {
  if (!value) return '—';
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
};

const GovernanceDelegationPanel: React.FC = () => {
  const {
    delegateTo,
    candidate,
    candidateEns,
    isValid,
    validationError,
    willChainBeLimited,
    ownPower,
    receivedPower,
    totalPower,
    incomingDelegations,
    status,
    transferInFlight,
    setCandidate,
    resolveEnsName,
    delegate,
    removeDelegation,
  } = useDelegation();

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-in fade-in duration-500">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">Delegation</h3>
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Governance</span>
      </div>

      <div className="mb-4 rounded-xl border border-stellar/20 bg-stellar/5 p-3">
        <div className="mb-2 text-sm text-gray-500">Current delegate</div>
        <div className="flex items-center justify-between">
          <div className="text-md font-semibold text-gray-900">{delegateTo ? formatTrim(delegateTo) : 'Not delegated'}</div>
          {delegateTo && (
            <button
              type="button"
              onClick={removeDelegation}
              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              Remove Delegation
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="delegate-address" className="mb-1 block text-sm font-medium text-gray-700">
          Delegate to...
        </label>
        <input
          id="delegate-address"
          value={candidate}
          onChange={(e) => setCandidate(e.target.value)}
          onBlur={(e) => e.target.value.endsWith('.eth') && resolveEnsName(e.target.value.trim())}
          placeholder="Stellar address or ENS (.eth)"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-stellar focus:ring-2 focus:ring-stellar/20"
        />
        {candidateEns && (
          <p className="mt-1 text-xs text-gray-500">ENS resolved: {candidateEns} → {candidate}</p>
        )}
        {validationError && <p className="mt-1 text-xs text-red-600">{validationError}</p>}
        {willChainBeLimited && (
          <p className="mt-1 text-xs font-semibold text-amber-700">Warning: target already delegated (chain limit applies).</p>
        )}
      </div>

      <div className="mb-5 flex items-center gap-2">
        <button
          type="button"
          onClick={delegate}
          disabled={!isValid || status === 'signing' || status === 'awaiting-signature'}
          className="rounded-lg bg-stellar px-3 py-2 text-sm font-semibold text-white transition hover:bg-stellar-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {status === 'signing' || status === 'awaiting-signature' ? 'Awaiting Freighter...' : 'Delegate'}
        </button>
        {status === 'success' && <span className="text-sm font-medium text-emerald-600">Delegation updated</span>}
      </div>

      <div className="mb-5 rounded-xl border border-gray-200 p-4">
        <div className="mb-1 text-sm text-gray-500">Voting Power</div>
        <div className="text-2xl font-black text-gray-900">{totalPower.toLocaleString()}</div>
        <div className="mt-1 text-sm text-gray-500">Own: {delegateTo ? 0 : ownPower.toLocaleString()} + Received: {receivedPower.toLocaleString()}</div>
      </div>

      <div className="mb-3 text-sm font-semibold text-gray-700">Token flow</div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full bg-gradient-to-r from-stellar to-cyan-500 transition-all ${transferInFlight ? 'w-full animate-pulse' : 'w-0'}`}
        />
      </div>
      {transferInFlight && <p className="mb-4 text-sm text-stellar">Animating vote power transfer...</p>}

      <div>
        <h4 className="mb-2 text-sm font-semibold">Delegated to you</h4>
        <ul className="space-y-2 text-sm">
          {incomingDelegations.map((item) => (
            <li key={item.address} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{formatTrim(item.address)}</span>
                <span className="text-xs font-bold text-gray-600">{item.power.toLocaleString()} VP</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default GovernanceDelegationPanel;
