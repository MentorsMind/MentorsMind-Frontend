import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import SessionRoom from '../pages/SessionRoom';
import { useWebRTC } from '../hooks/useWebRTC';

vi.mock('../hooks/useWebRTC', () => ({
  useWebRTC: vi.fn(),
}));

const mockedUseWebRTC = vi.mocked(useWebRTC);

const createMockStream = (videoTrackCount = 1) =>
  ({
    getTracks: () => [],
    getAudioTracks: () => [],
    getVideoTracks: () =>
      Array.from({ length: videoTrackCount }, (_, index) => ({
        id: `video-${index}`,
      })),
  }) as unknown as MediaStream;

const connect = vi.fn();
const disconnect = vi.fn();
const toggleMute = vi.fn();
const toggleCamera = vi.fn();
const toggleScreenShare = vi.fn();
const endSession = vi.fn();
const retry = vi.fn();

const baseHookState = {
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
  error: null,
  localStream: null,
  remoteStream: null,
  screenStream: null,
  isScreenSharing: false,
  isMuted: false,
  isCameraOff: false,
  isAudioOnly: false,
  sessionDuration: 95,
  connectionQuality: 'Excellent' as const,
  rttMs: 48,
  screenShareSupported: true,
  connect,
  disconnect,
  toggleMute,
  toggleCamera,
  toggleScreenShare,
  endSession,
  retry,
};

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
    configurable: true,
    writable: true,
    value: null,
  });

  Object.defineProperty(document, 'pictureInPictureEnabled', {
    configurable: true,
    value: false,
  });

  Object.defineProperty(document, 'pictureInPictureElement', {
    configurable: true,
    writable: true,
    value: null,
  });

  Object.defineProperty(document, 'exitPictureInPicture', {
    configurable: true,
    value: vi.fn(),
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseWebRTC.mockReturnValue(baseHookState);
});

describe('SessionRoom WebRTC flow', () => {
  it('renders the join screen and starts the session when requested', () => {
    render(<SessionRoom sessionId="session-139" mentorName="Ada" />);

    expect(screen.getByText('Ready to join?')).not.toBeNull();

    fireEvent.click(screen.getByText('Join Session'));

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('renders the live WebRTC layout and notes panel', () => {
    mockedUseWebRTC.mockReturnValue({
      ...baseHookState,
      isConnected: true,
      isAudioOnly: true,
      localStream: createMockStream(0),
      remoteStream: createMockStream(),
    });

    render(<SessionRoom sessionId="session-139" mentorName="Ada" sessionTopic="WebRTC Review" />);

    expect(screen.getByText('WebRTC Review')).not.toBeNull();
    expect(screen.getByText('Excellent')).not.toBeNull();
    expect(screen.getByText('Audio-only fallback is active because video capture failed.')).not.toBeNull();

    fireEvent.click(screen.getByLabelText('Toggle notes'));

    expect(screen.getByText('Session Notes')).not.toBeNull();
    expect(screen.getByText('Mic On')).not.toBeNull();
    expect(screen.getByText('Share Screen')).not.toBeNull();
  });
});
