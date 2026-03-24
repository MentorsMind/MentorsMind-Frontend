import React from 'react';
import type { StellarAsset, StellarAssetCode } from '../../types/payment.types';

interface PaymentMethodProps {
  assets: StellarAsset[];
  selectedAsset: StellarAssetCode;
  onSelect: (asset: StellarAssetCode) => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ assets, selectedAsset, onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {assets.map((asset) => (
          <button
            key={asset.code}
            onClick={() => onSelect(asset.code)}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
              selectedAsset === asset.code
                ? 'border-stellar bg-stellar/5 ring-1 ring-stellar/20'
                : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                {asset.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{asset.name}</h4>
                <p className="text-xs text-gray-500 font-medium">{asset.code}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{asset.balance.toLocaleString()} {asset.code}</p>
              <p className="text-[10px] text-gray-400 font-medium">Available Balance</p>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 flex gap-3">
        <div className="text-blue-500 mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h5 className="text-xs font-bold text-blue-900">Payment Security</h5>
          <p className="text-[10px] text-blue-700 leading-relaxed mt-0.5">
            Your payment is held in a secure Stellar escrow and only released to the mentor after the session is completed or confirmed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
