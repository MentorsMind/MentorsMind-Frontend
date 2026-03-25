import React from 'react';
import { ShieldCheck, ExternalLink, Loader2, CheckCircle2, XCircle, Info } from 'lucide-react';
import type { StellarAssetCode } from '../../types/payment.types';
import type { AssetWithMeta } from '../../hooks/useAssets';

interface TrustlineSetupProps {
  asset: AssetWithMeta;
  onSetup: (code: StellarAssetCode) => void;
  status: 'idle' | 'loading' | 'success' | 'error';
}

const STELLAR_EXPERT_BASE = 'https://stellar.expert/explorer/public/asset';

const TrustlineSetup: React.FC<TrustlineSetupProps> = ({ asset, onSetup, status }) => {
  if (asset.trustlineEstablished) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Trustline active</p>
          <p className="text-xs text-emerald-600">You can send and receive {asset.code}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-900">Trustline required</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            To hold or receive {asset.name} ({asset.code}) on Stellar, you need to establish a
            trustline. This reserves a small XLM balance (~0.5 XLM) in your account.
          </p>
        </div>
      </div>

      {/* Asset info */}
      <div className="rounded-xl bg-white border border-amber-100 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{asset.icon}</span>
          <div>
            <p className="text-sm font-bold text-gray-900">{asset.name}</p>
            <p className="text-xs text-gray-500">{asset.code}</p>
          </div>
        </div>
        {asset.issuer && (
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Issuer</p>
              <p className="text-xs text-gray-600 font-mono break-all">{asset.issuer}</p>
            </div>
          </div>
        )}
        {asset.issuer && (
          <a
            href={`${STELLAR_EXPERT_BASE}/${asset.code}-${asset.issuer}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-stellar hover:underline"
          >
            View on Stellar Expert <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Status feedback */}
      {status === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700">Setup failed. Please try again.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-xs text-emerald-700">Trustline established successfully.</p>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={() => onSetup(asset.code)}
        disabled={status === 'loading' || status === 'success'}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stellar text-white text-sm font-semibold transition-all duration-200 hover:bg-stellar-dark disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Setting up trustline...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Trustline active
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Establish Trustline
          </>
        )}
      </button>
    </div>
  );
};

export default TrustlineSetup;
