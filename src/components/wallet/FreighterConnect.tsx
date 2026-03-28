import React from 'react';

export default function FreighterConnect({ 
  showNetworkIndicator, 
  onConnect, 
  onDisconnect 
}: { 
  showNetworkIndicator?: boolean, 
  onConnect?: (info: any) => void, 
  onDisconnect?: () => void 
}) {
  return (
    <div className="p-4 border border-gray-100 rounded-3xl bg-white shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-stellar/10 rounded-xl flex items-center justify-center text-stellar font-bold">F</div>
        <div>
          <h3 className="font-bold text-gray-900">Freighter Wallet</h3>
          {showNetworkIndicator && <p className="text-xs text-gray-400">Not connected</p>}
        </div>
      </div>
      <button 
        onClick={() => onConnect?.({ publicKey: 'mock-key', network: 'TESTNET' })}
        className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors"
      >
        Simulate Connect
      </button>
    </div>
  );
}
