import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import SessionRoom from '../pages/SessionRoom';
import { useWebRTC } from '../hooks/useWebRTC';
import { DEMO_REMOTE_RESPONSE_DELAY_MS } from '../hooks/useRecording';

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

let mockHookState = {
  isConnected: true,
  isConnecting: false,
  isReconnecting: false,
  error: null,
  localStream: createMockStream(0),
  remoteStream: createMockStream(),
  screenStream: null,
  isScreenSharing: false,
  isMuted: false,
  isCameraOff: false,
  isAudioOnly: false,
  sessionDuration: 90,
  connectionQuality: 'Excellent' as const,
  rttMs: 44,
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

describe('SessionRoom recording consent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockHookState = {
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      error: null,
      localStream: createMockStream(0),
      remoteStream: createMockStream(),
      screenStream: null,
      isScreenSharing: false,
      isMuted: false,
      isCameraOff: false,
      isAudioOnly: false,
      sessionDuration: 90,
      connectionQuality: 'Excellent' as const,
      rttMs: 44,
      screenShareSupported: true,
      connect,
      disconnect,
      toggleMute,
      toggleCamera,
      toggleScreenShare,
      endSession,
      retry,
    };
    mockedUseWebRTC.mockImplementation(() => mockHookState);
  });

  it('requests recording consent and exposes a post-session download card', () => {
    const { rerender } = render(<SessionRoom sessionId="session-140" mentorName="Mentor Ada" />);

    expect(screen.getByRole('button', { name: 'Request Recording' })).not.toBeNull();
    expect(screen.getByText('Recordings are stored for 30 days then deleted')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Request Recording' }));

    act(() => {
      vi.advanceTimersByTime(DEMO_REMOTE_RESPONSE_DELAY_MS + 50);
    });

    expect(screen.getByText('REC')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Stop Recording' })).not.toBeNull();

    act(() => {
      mockHookState = { ...mockHookState, isConnected: false };
      rerender(<SessionRoom sessionId="session-140" mentorName="Mentor Ada" />);
    });

    expect(screen.getByRole('link', { name: 'Download recording' })).not.toBeNull();
    expect(screen.getByText(/On-chain consent metadata/i)).not.toBeNull();
  });
});
