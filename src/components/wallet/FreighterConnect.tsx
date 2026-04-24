import React from 'react';
import * as Freighter from '@stellar/freighter-api';

interface WalletInfo {
  address: string;
}

interface Props {
  showNetworkIndicator?: boolean;
  onConnect?: (walletInfo: WalletInfo) => void;
  onDisconnect?: (error?: string) => void;
  compact?: boolean;
  className?: string;
}

export const FreighterConnect: React.FC<Props> = ({ 
  showNetworkIndicator = false, 
  onConnect, 
  onDisconnect,
  compact = false,
  className = ''
}) => {
  const [address, setAddress] = React.useState<string | null>(null);

  const handleConnect = async () => {
    try {
      if (await Freighter.isConnected()) {
        const addressResult = await Freighter.getAddress();
        if (addressResult.address) {
          setAddress(addressResult.address);
          onConnect?.({ address: addressResult.address });
        }
      } else {
        alert('Please install Freighter extension');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      onDisconnect?.(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    onDisconnect?.();
  };

  if (address) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showNetworkIndicator && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {compact ? `${address.slice(0, 4)}...${address.slice(-4)}` : address}
        </span>
        <button
          onClick={handleDisconnect}
          className="text-xs text-red-500 hover:text-red-700 font-bold"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className={`px-4 py-2 bg-stellar text-white rounded-xl font-bold hover:bg-stellar/90 transition-all ${className}`}
    >
      Connect wallet
    </button>
  );
};
