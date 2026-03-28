import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

export interface FreighterConnectProps {
  compact?: boolean;
  showNetworkIndicator?: boolean;
  className?: string;
  onConnect?: (walletInfo: { publicKey: string; network?: string }) => void;
  onDisconnect?: () => void;
}

/**
 * Placeholder UI until Freighter wiring is complete. Keeps layout and imports valid.
 */
export function FreighterConnect({
  compact = false,
  showNetworkIndicator = false,
  className = '',
  onConnect,
  onDisconnect,
}: FreighterConnectProps) {
  const [connected, setConnected] = useState(false);

  const handleClick = () => {
    if (connected) {
      setConnected(false);
      onDisconnect?.();
      return;
    }
    const mock = { publicKey: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', network: 'testnet' };
    setConnected(true);
    onConnect?.(mock);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showNetworkIndicator && (
        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
          Testnet
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        }`}
      >
        <Wallet className="h-4 w-4 text-stellar" aria-hidden />
        {connected ? 'Disconnect' : 'Connect Freighter'}
      </button>
    </div>
  );
}
