import React from 'react';

interface RecordingIndicatorProps {
  isRecording: boolean;
  retentionNotice: string;
  metadataReference?: string;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  isRecording,
  retentionNotice,
  metadataReference,
}) => {
  if (!isRecording) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-3 rounded-full border border-red-400/30 bg-red-500/15 px-4 py-2 text-white"
    >
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
      </span>
      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-black tracking-[0.18em]">REC</span>
      <span className="text-sm font-semibold">{retentionNotice}</span>
      {metadataReference && <span className="hidden text-xs text-white/70 sm:inline">On-chain: {metadataReference}</span>}
    </div>
  );
};

export default RecordingIndicator;
