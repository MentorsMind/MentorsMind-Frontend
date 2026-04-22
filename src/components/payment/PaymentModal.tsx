import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Alert from '../ui/Alert';
import type { AssetType, Mentor } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
  sessionDuration: number; // minutes
  onSuccess?: (txHash: string) => void;
}

const PLATFORM_FEE = 0.05;
const ASSETS: AssetType[] = ['XLM', 'USDC', 'PYUSD'];

type Step = 'review' | 'processing' | 'success' | 'error';

export default function PaymentModal({ isOpen, onClose, mentor, sessionDuration, onSuccess }: PaymentModalProps) {
  const [asset, setAsset] = useState<AssetType>('XLM');
  const [step, setStep] = useState<Step>('review');
  const [txHash, setTxHash] = useState('');

  const sessionPrice = (mentor.hourlyRate * sessionDuration) / 60;
  const platformFee = sessionPrice * PLATFORM_FEE;
  const total = sessionPrice + platformFee;

  const handlePay = async () => {
    setStep('processing');
    // Simulate Stellar transaction
    await new Promise(r => setTimeout(r, 2500));
    const mockHash = 'TX' + Math.random().toString(36).substring(2, 18).toUpperCase();
    setTxHash(mockHash);
    setStep('success');
    onSuccess?.(mockHash);
  };

  const handleClose = () => { setStep('review'); onClose(); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'review' ? 'Confirm Payment' : undefined} size="md">
      {step === 'review' && (
        <div className="space-y-5">
          {/* Mentor info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {mentor.name[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">{mentor.name}</p>
              <p className="text-sm text-gray-500">{sessionDuration} min session</p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Escrow Protected</span>
          </div>

          {/* Asset selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Pay with</p>
            <div className="flex gap-2">
              {ASSETS.map(a => (
                <button key={a} onClick={() => setAsset(a)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors
                    ${asset === a ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Session fee ({sessionDuration} min)</span>
              <span>{sessionPrice.toFixed(2)} {asset}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform fee (5%)</span>
              <span>{platformFee.toFixed(2)} {asset}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{total.toFixed(2)} {asset}</span>
            </div>
          </div>

          <Alert type="info">Funds are held in escrow and released to the mentor after session completion.</Alert>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
            <Button onClick={handlePay} className="flex-1">Pay {total.toFixed(2)} {asset}</Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900">Processing on Stellar...</p>
          <p className="text-sm text-gray-500">Submitting transaction to the blockchain</p>
        </div>
      )}

      {step === 'success' && (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
          <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
          <p className="text-sm text-gray-500">Your session is confirmed and funds are in escrow.</p>
          <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 break-all">{txHash}</div>
          <Button onClick={handleClose} className="w-full">Done</Button>
        </div>
      )}

      {step === 'error' && (
        <div className="py-8 text-center space-y-4">
          <div className="text-5xl">❌</div>
          <h3 className="text-xl font-bold text-gray-900">Payment Failed</h3>
          <p className="text-sm text-gray-500">Something went wrong. Please try again.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
            <Button onClick={() => setStep('review')} className="flex-1">Try Again</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
