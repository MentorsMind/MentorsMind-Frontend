import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Mic, Wifi, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export type ConnectionCheckStatus = 'idle' | 'running' | 'pass' | 'fail';

export interface ConnectionTestProps {
  onAllChecksPass?: () => void;
  className?: string;
}

function ConnectionCheckStatusIcon({ status }: { status: ConnectionCheckStatus }) {
  if (status === 'running') return <Loader2 className="h-5 w-5 animate-spin text-stellar" aria-hidden />;
  if (status === 'pass') return <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />;
  if (status === 'fail') return <XCircle className="h-5 w-5 text-red-500" aria-hidden />;
  return <span className="h-5 w-5 rounded-full border-2 border-gray-200" aria-hidden />;
}

async function measureNetworkQuality(): Promise<{ ok: boolean; mbps?: number }> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  type NavConn = Navigator & { connection?: { downlink?: number } };
  const conn = nav && 'connection' in nav ? (nav as NavConn).connection : undefined;
  if (conn?.downlink != null && conn.downlink > 0) {
    return { ok: conn.downlink >= 0.5, mbps: conn.downlink };
  }
  try {
    const t0 = performance.now();
    await fetch(`${window.location.origin}/`, { method: 'GET', cache: 'no-store' });
    const ms = performance.now() - t0;
    if (ms > 8000) return { ok: false };
    const estimatedMbps = Math.min(100, Math.max(0.5, 2000 / ms));
    return { ok: ms < 5000, mbps: estimatedMbps };
  } catch {
    return { ok: false };
  }
}

export const ConnectionTest: React.FC<ConnectionTestProps> = ({ onAllChecksPass, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camera, setCamera] = useState<ConnectionCheckStatus>('idle');
  const [mic, setMic] = useState<ConnectionCheckStatus>('idle');
  const [network, setNetwork] = useState<ConnectionCheckStatus>('idle');
  const [networkMbps, setNetworkMbps] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewActive, setPreviewActive] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setPreviewActive(false);
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  const startPreview = useCallback(async () => {
    setError(null);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPreviewActive(true);
    } catch {
      setError('Camera or microphone permission was denied. Allow access in your browser settings.');
    }
  }, [stopStream]);

  const runFullTest = useCallback(async () => {
    setError(null);
    setCamera('running');
    setMic('running');
    setNetwork('running');
    setNetworkMbps(null);

    let stream = streamRef.current;
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPreviewActive(true);
      } catch {
        setCamera('fail');
        setMic('fail');
        setNetwork('idle');
        setError('Could not access camera or microphone.');
        return;
      }
    }

    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    setCamera(videoTrack?.readyState === 'live' ? 'pass' : 'fail');
    setMic(audioTrack?.readyState === 'live' ? 'pass' : 'fail');

    const net = await measureNetworkQuality();
    setNetworkMbps(net.mbps ?? null);
    setNetwork(net.ok ? 'pass' : 'fail');

    const allPass =
      videoTrack?.readyState === 'live' && audioTrack?.readyState === 'live' && net.ok;
    if (allPass) {
      onAllChecksPass?.();
    }
  }, [onAllChecksPass]);

  return (
    <section
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}
      aria-labelledby="waiting-connection-heading"
    >
      <h2 id="waiting-connection-heading" className="text-lg font-semibold text-gray-900">
        Test your camera and microphone
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        We will check your devices and a quick network estimate before you enter the session.
      </p>

      <div className="relative mt-4 flex max-h-56 aspect-video items-center justify-center overflow-hidden rounded-xl bg-gray-900">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          aria-label="Local camera preview"
        />
        {!previewActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900/90 px-4 text-center">
            <Camera className="h-10 w-10 text-gray-500" aria-hidden />
            <p className="text-sm text-gray-300">Preview is off until you allow camera access</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startPreview}
          className="rounded-xl bg-stellar px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          Start preview
        </button>
        <button
          type="button"
          onClick={runFullTest}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Run connection test
        </button>
        {previewActive && (
          <button
            type="button"
            onClick={stopStream}
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Stop preview
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Connection test</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-3 text-gray-800">
            <Camera className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <span className="flex-1">Camera</span>
            <ConnectionCheckStatusIcon status={camera} />
          </li>
          <li className="flex items-center gap-3 text-gray-800">
            <Mic className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <span className="flex-1">Microphone</span>
            <ConnectionCheckStatusIcon status={mic} />
          </li>
          <li className="flex items-center gap-3 text-gray-800">
            <Wifi className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <span className="flex-1">
              Network
              {networkMbps != null && network !== 'idle' && (
                <span className="ml-2 text-gray-500">(~{networkMbps.toFixed(1)} Mbps est.)</span>
              )}
            </span>
            <ConnectionCheckStatusIcon status={network} />
          </li>
        </ul>
      </div>
    </section>
  );
};
