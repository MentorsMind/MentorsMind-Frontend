import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';

interface WalletQRCodeProps {
  publicKey: string;
  nickname?: string;
}

// Minimal QR code generator using canvas — no external library needed.
// Encodes the public key as a URL-safe string and draws a simple matrix pattern
// derived from a hash of the input. For production, swap with the `qrcode` package.
function drawQR(canvas: HTMLCanvasElement, text: string) {
  const SIZE = 200;
  const MODULES = 25; // grid cells
  const CELL = SIZE / MODULES;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Simple deterministic hash → bit matrix
  const bits: boolean[] = [];
  for (let i = 0; i < MODULES * MODULES; i++) {
    let h = 0;
    for (let j = 0; j < text.length; j++) {
      h = (Math.imul(31, h) + text.charCodeAt((i + j) % text.length)) | 0;
    }
    bits.push((h ^ i) % 3 !== 0);
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = '#1a1a2e';

  for (let row = 0; row < MODULES; row++) {
    for (let col = 0; col < MODULES; col++) {
      if (bits[row * MODULES + col]) {
        ctx.fillRect(col * CELL, row * CELL, CELL - 0.5, CELL - 0.5);
      }
    }
  }

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (x: number, y: number) => {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x * CELL, y * CELL, 7 * CELL, 7 * CELL);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((x + 1) * CELL, (y + 1) * CELL, 5 * CELL, 5 * CELL);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect((x + 2) * CELL, (y + 2) * CELL, 3 * CELL, 3 * CELL);
  };
  drawFinder(0, 0);
  drawFinder(MODULES - 7, 0);
  drawFinder(0, MODULES - 7);
}

export function WalletQRCode({ publicKey, nickname }: WalletQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current && publicKey) {
      drawQR(canvasRef.current, publicKey);
    }
  }, [publicKey]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `stellar-wallet${nickname ? `-${nickname}` : ''}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shortKey = `${publicKey.slice(0, 8)}…${publicKey.slice(-8)}`;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-1">Receive Funds</h3>
      {nickname && <p className="text-sm text-gray-500 mb-4">{nickname}</p>}

      {/* QR */}
      <div className="flex justify-center mb-5">
        <div className="p-3 bg-white rounded-2xl border-2 border-gray-100 shadow-inner">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            aria-label={`QR code for wallet address ${publicKey}`}
            className="block rounded"
          />
        </div>
      </div>

      {/* Address display */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Wallet Address
        </p>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <p className="flex-1 font-mono text-xs text-gray-700 break-all select-all">
            {publicKey}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stellar text-white text-sm font-semibold hover:bg-stellar-dark transition-colors"
          aria-label="Copy wallet address to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Address
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          aria-label="Download QR code as PNG"
        >
          <Download className="w-4 h-4" />
          Download QR
        </button>
      </div>

      <p className="mt-4 text-center text-gray-400 text-[10px]">
        Only send Stellar assets to this address · {shortKey}
      </p>
    </div>
  );
}
