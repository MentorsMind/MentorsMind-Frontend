import React, { useState } from 'react';
import { useFreighter } from '../../hooks/useFreighter';
import ConfirmationModal from './ConfirmationModal';

interface LendPanelProps {
  lpBalance: number;
  poolAPY: number;
  isProcessing: boolean;
  onDeposit: (amount: number) => void | Promise<void>;
  onWithdraw: (amount: number) => void | Promise<void>;
}

const LendPanel: React.FC<LendPanelProps> = ({
  lpBalance,
  poolAPY,
  isProcessing,
  onDeposit,
  onWithdraw,
}) => {
  const { isConnected, connect } = useFreighter();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'deposit' | 'withdraw' | null;
    amount: number;
  }>({ isOpen: false, type: null, amount: 0 });

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;
    setModalState({ isOpen: true, type: 'deposit', amount });
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > lpBalance) return;
    setModalState({ isOpen: true, type: 'withdraw', amount });
  };

  const handleConfirm = async () => {
    if (modalState.type === 'deposit') {
      await onDeposit(modalState.amount);
      setDepositAmount('');
    } else if (modalState.type === 'withdraw') {
      await onWithdraw(modalState.amount);
      setWithdrawAmount('');
    }
    setModalState({ isOpen: false, type: null, amount: 0 });
  };

  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalState({ isOpen: false, type: null, amount: 0 });
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4 flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-stellar/10 rounded-full flex items-center justify-center text-stellar mb-2">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Connect Wallet to Lend</h3>
        <p className="text-gray-500 max-w-sm">
          Please connect your Freighter wallet to supply liquidity and earn {poolAPY}% APY on your USDC.
        </p>
        <button
          onClick={connect}
          className="mt-4 px-8 py-3 bg-stellar hover:bg-stellar-dark text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          Connect Freighter
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <h3 className="text-gray-500 text-sm font-semibold mb-1">Your LP Balance</h3>
          <span className="text-2xl font-bold text-gray-900 tabular-nums">
            ${lpBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100/50">
          <h3 className="text-emerald-700 text-sm font-semibold mb-1">Current Yield</h3>
          <span className="text-2xl font-bold text-emerald-600 tabular-nums">
            {poolAPY}% <span className="text-sm font-medium">APY</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              activeTab === 'deposit' 
                ? 'text-stellar border-b-2 border-stellar bg-stellar/5' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Deposit USDC
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              activeTab === 'withdraw' 
                ? 'text-stellar border-b-2 border-stellar bg-stellar/5' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Withdraw USDC
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'deposit' ? (
            <form onSubmit={handleDepositSubmit} className="space-y-6">
              <div>
                <label htmlFor="deposit-amount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount to Deposit
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    id="deposit-amount"
                    min="1"
                    step="any"
                    required
                    disabled={isProcessing}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-stellar focus:ring-2 focus:ring-stellar/20 text-gray-900 font-bold tabular-nums transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !parseFloat(depositAmount)}
                className="w-full px-6 py-4 bg-stellar hover:bg-stellar-dark text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Waiting for Freighter...' : 'Deposit via Freighter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="space-y-6">
              <div>
                <label htmlFor="withdraw-amount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    id="withdraw-amount"
                    min="1"
                    max={lpBalance}
                    step="any"
                    required
                    disabled={isProcessing}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-stellar focus:ring-2 focus:ring-stellar/20 text-gray-900 font-bold tabular-nums transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(lpBalance.toString())}
                    className="text-xs font-bold text-stellar hover:underline"
                  >
                    Max: ${lpBalance.toLocaleString()}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !parseFloat(withdrawAmount) || parseFloat(withdrawAmount) > lpBalance}
                className="w-full px-6 py-4 bg-white border-2 border-stellar text-stellar hover:bg-stellar/5 font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Waiting for Freighter...' : 'Withdraw via Freighter'}
              </button>
            </form>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.type === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
        message={
          modalState.type === 'deposit'
            ? `Are you sure you want to deposit $${modalState.amount.toFixed(2)} USDC to the lending pool? Please sign the transaction in Freighter.`
            : `Are you sure you want to withdraw $${modalState.amount.toFixed(2)} USDC from the lending pool? Please sign the transaction in Freighter.`
        }
        confirmText={modalState.type === 'deposit' ? 'Deposit' : 'Withdraw'}
        isProcessing={isProcessing}
        onConfirm={handleConfirm}
        onCancel={handleCloseModal}
      />
    </div>
  );
};

export default LendPanel;
