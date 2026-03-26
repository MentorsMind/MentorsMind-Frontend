import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

interface WalletAddressProps {
  publicKey: string;
  nickname?: string;
}

export const WalletAddress = ({ publicKey, nickname }: WalletAddressProps) => {
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate QR code
    // TODO: Use a proper QR code library like qrcode or qr-code-styling
    generateSimpleQR(publicKey);
  }, [publicKey]);

  const generateSimpleQR = (text: string) => {
    // Placeholder for QR code generation
    // In production, use: import QRCode from 'qrcode'
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;

    // Simple placeholder pattern
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px monospace';
    ctx.fillText('QR Code', 70, 100);
    ctx.fillText('Placeholder', 60, 115);
    
    setQrCode(canvas.toDataURL());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey).catch((err) => {
      console.error('Failed to copy:', err);
    });
    flushSync(() => {
      setCopied(true);
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'My Stellar Wallet Address',
          text: `Send Stellar assets to: ${publicKey}`
        })
        .catch((err) => {
        console.error('Share failed:', err);
        });
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `stellar-wallet-${nickname || 'address'}.png`;
    link.href = qrCode;
    link.click();
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2 text-center">Receive Funds</h2>
        {nickname && (
          <p className="text-gray-600 text-center mb-4">{nickname}</p>
        )}

        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="block"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Wallet Address
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
              <p className="font-mono text-sm break-all">{publicKey}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={downloadQR}
            className="flex items-center justify-center space-x-2 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </button>
        </div>

        {navigator.share && (
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Only send Stellar (XLM) and Stellar-based assets to this address. 
            Sending other cryptocurrencies may result in permanent loss.
          </p>
        </div>
      </div>
    </div>
  );
};
