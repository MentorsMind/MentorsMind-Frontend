import React from 'react';
import { Camera, CameraOff, Mic, MicOff, Monitor, PhoneOff, PictureInPicture2 } from 'lucide-react';

interface VideoControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isAudioOnly: boolean;
  isPictureInPicture: boolean;
  pipSupported: boolean;
  disabled?: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onTogglePictureInPicture: () => void;
  onEndSession: () => void;
}

interface ControlButtonProps {
  label: string;
  active: boolean;
  disabled?: boolean;
  tone?: 'default' | 'danger' | 'success';
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}

const buttonToneStyles: Record<NonNullable<ControlButtonProps['tone']>, string> = {
  default: 'bg-white/10 text-white hover:bg-white/20',
  danger: 'bg-rose-500 text-white hover:bg-rose-600',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600',
};

const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  active,
  disabled = false,
  tone = 'default',
  icon,
  description,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex min-w-24 flex-col items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
      active ? buttonToneStyles[tone] : 'bg-white/10 text-white hover:bg-white/20'
    }`}
    aria-pressed={active}
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20">{icon}</span>
    <span>{label}</span>
    <span className="text-xs font-medium text-white/70">{description}</span>
  </button>
);

const VideoControls: React.FC<VideoControlsProps> = ({
  isMuted,
  isCameraOff,
  isScreenSharing,
  isAudioOnly,
  isPictureInPicture,
  pipSupported,
  disabled = false,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onTogglePictureInPicture,
  onEndSession,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-[28px] bg-slate-950/80 p-3 backdrop-blur-xl">
      <ControlButton
        label={isMuted ? 'Mic Off' : 'Mic On'}
        active={isMuted}
        tone="danger"
        description={isMuted ? 'Muted' : 'Live'}
        icon={isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        onClick={onToggleMute}
        disabled={disabled}
      />

      <ControlButton
        label={isCameraOff ? 'Camera Off' : 'Camera On'}
        active={isCameraOff}
        tone="danger"
        description={isAudioOnly ? 'Audio-only fallback' : isCameraOff ? 'Video paused' : 'Streaming'}
        icon={isCameraOff ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
        onClick={onToggleCamera}
        disabled={disabled}
      />

      <ControlButton
        label="Share Screen"
        active={isScreenSharing}
        tone="success"
        description={isScreenSharing ? 'Sharing now' : 'Share display'}
        icon={<Monitor className="h-5 w-5" />}
        onClick={onToggleScreenShare}
        disabled={disabled}
      />

      <ControlButton
        label="PiP"
        active={isPictureInPicture}
        description={pipSupported ? (isPictureInPicture ? 'Exit floating mode' : 'Float main video') : 'Not supported'}
        icon={<PictureInPicture2 className="h-5 w-5" />}
        onClick={onTogglePictureInPicture}
        disabled={disabled || !pipSupported}
      />

      <button
        type="button"
        onClick={onEndSession}
        disabled={disabled}
        className="flex min-w-28 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 text-sm font-bold text-white transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <PhoneOff className="h-5 w-5" />
        End Session
      </button>
    </div>
  );
};

export default VideoControls;
