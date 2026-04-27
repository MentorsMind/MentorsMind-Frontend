import React, { useEffect, useRef } from 'react';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isRemoteVideoOff: boolean;
  isScreenSharing: boolean;
  isAudioOnly: boolean;
  isReconnecting: boolean;
  remoteName: string;
  localName?: string;
  primaryVideoRef: React.RefObject<HTMLVideoElement | null>;
}

const attachStream = (video: HTMLVideoElement | null, stream: MediaStream | null) => {
  if (!video) {
    return;
  }

  if (video.srcObject !== stream) {
    video.srcObject = stream;
  }
};

const VideoPreview: React.FC<{
  title: string;
  subtitle: string;
  stream: MediaStream | null;
  muted?: boolean;
  mirror?: boolean;
  showVideo: boolean;
}> = ({ title, subtitle, stream, muted = false, mirror = false, showVideo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    attachStream(videoRef.current, stream);
  }, [stream]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70">
      {showVideo && stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted={muted}
          playsInline
          className="h-full w-full object-cover"
          style={mirror ? { transform: 'scaleX(-1)' } : undefined}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.88))] px-6 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 text-2xl font-bold">
            {title.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-1 text-sm text-white/65">{subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStream,
  screenStream,
  isMuted,
  isCameraOff,
  isRemoteVideoOff,
  isScreenSharing,
  isAudioOnly,
  isReconnecting,
  remoteName,
  localName = 'You',
  primaryVideoRef,
}) => {
  useEffect(() => {
    attachStream(primaryVideoRef.current, remoteStream);
  }, [primaryVideoRef, remoteStream]);

  const showRemoteVideo = !isRemoteVideoOff && Boolean(remoteStream);

  return (
    <div className="relative min-h-[26rem] overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_40%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(2,6,23,0.94))] shadow-2xl shadow-slate-950/50">
      {showRemoteVideo ? (
        <video
          ref={primaryVideoRef}
          autoPlay
          muted
          playsInline
          className="h-full min-h-[26rem] w-full object-cover"
        />
      ) : (
        <VideoPreview
          title={remoteName}
          subtitle={
            isAudioOnly
              ? 'Video is unavailable, continuing in audio-only mode.'
              : 'The remote video feed is currently unavailable.'
          }
          stream={null}
          showVideo={false}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
        <div className="rounded-full bg-black/45 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
          {remoteName}
        </div>

        {isScreenSharing && (
          <div className="rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20">
            Screen sharing live
          </div>
        )}
      </div>

      {isScreenSharing && screenStream && (
        <div className="absolute left-5 top-20 h-28 w-44 rounded-[22px] border border-emerald-300/30 bg-slate-950/85 p-2 shadow-xl shadow-slate-950/35">
          <VideoPreview
            title="Screen"
            subtitle="Preview"
            stream={screenStream}
            muted
            showVideo
          />
        </div>
      )}

      <div className="absolute bottom-5 right-5 h-28 w-44 md:h-36 md:w-56">
        <div className="absolute inset-0 rounded-[24px] bg-black/20 shadow-2xl shadow-black/30" />
        <VideoPreview
          title={localName}
          subtitle={isMuted ? 'Muted' : isCameraOff ? 'Camera off' : 'Live preview'}
          stream={localStream}
          muted
          mirror
          showVideo={!isCameraOff && Boolean(localStream?.getVideoTracks().length)}
        />
      </div>

      {isReconnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="rounded-[28px] border border-amber-300/20 bg-black/55 px-8 py-6 text-center text-white shadow-2xl shadow-black/40">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-amber-300/70 border-t-transparent" />
            <p className="text-lg font-semibold">Reconnecting...</p>
            <p className="mt-1 text-sm text-white/70">Trying to restore the peer connection.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
