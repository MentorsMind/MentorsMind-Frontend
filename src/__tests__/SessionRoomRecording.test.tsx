import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SessionRoom from '../pages/SessionRoom';
import { DEMO_REMOTE_RESPONSE_DELAY_MS } from '../hooks/useRecording';

let mockIsConnected = true;

vi.mock('../hooks/useVideoSession', () => ({
  useVideoSession: () => ({
    isConnected: mockIsConnected,
    isConnecting: false,
    error: null,
    participants: [
      {
        id: 'user-1',
        name: 'You',
        isHost: false,
        isMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
        connectionStatus: 'connected',
      },
      {
        id: 'mentor-1',
        name: 'Mentor Ada',
        isHost: true,
        isMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
        connectionStatus: 'connected',
      },
    ],
    isScreenSharing: false,
    isMuted: false,
    isVideoOff: false,
    sessionDuration: 90,
    connect: vi.fn(),
    disconnect: vi.fn(),
    toggleMute: vi.fn(),
    toggleVideo: vi.fn(),
    toggleScreenShare: vi.fn(),
    endSession: vi.fn(),
    retry: vi.fn(),
  }),
}));

describe('SessionRoom recording consent', () => {
  beforeEach(() => {
    mockIsConnected = true;
    vi.useFakeTimers();
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

    mockIsConnected = false;
    rerender(<SessionRoom sessionId="session-140" mentorName="Mentor Ada" />);

    expect(screen.getByRole('link', { name: 'Download recording' })).not.toBeNull();
    expect(screen.getByText(/On-chain consent metadata/i)).not.toBeNull();
  });
});
