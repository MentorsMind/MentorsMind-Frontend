import React, { useState, useEffect } from 'react';
import { freighterService } from '../../services/freighter.service';

interface FreighterConnectProps {
  onConnect?: (walletInfo: { publicKey: string; network: string }) => void;
  onDisconnect?: () => void;
  compact?: boolean;
  showNetworkIndicator?: boolean;
  className?: string;
}

export const FreighterConnect: React.FC<FreighterConnectProps> = ({ 
  onConnect, 
  onDisconnect, 
  compact = false,
  showNetworkIndicator = false,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(freighterService.isInstalled());
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const walletInfo = await freighterService.connect();
      onConnect(walletInfo);
    } catch (err: any) {
      setError(err.message || 'Failed to connect Freighter');
    } finally {
      setLoading(false);
    }
  };

  if (!isInstalled) {
    return (
      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <h3 className="font-bold text-amber-900">Freighter Not Found</h3>
          <p className="text-sm text-amber-700 mt-1">Please install the Freighter extension to continue.</p>
        </div>
        <a 
          href="https://www.freighter.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-2 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition shadow-sm"
        >
          Install Freighter
        </a>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center gap-6 text-center">
      <div className="w-20 h-20 bg-stellar/10 rounded-[2rem] flex items-center justify-center text-stellar">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Connect Your Wallet</h3>
        <p className="text-gray-500 mt-2 max-w-sm">Connect your Stellar wallet to view balances, transactions, and manage trustlines.</p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full py-4 bg-stellar text-white rounded-2xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-stellar/20 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            Connecting...
          </>
        ) : (
          'Connect with Freighter'
        )}
      </button>
    </div>
  );
};
