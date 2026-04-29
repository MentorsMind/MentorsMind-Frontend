import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api';
import {
  getBookingTransactionId,
  getDisputeStatusLabel,
  listDisputes,
  uploadDisputeEvidence,
} from '../dispute.service';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('dispute.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads transaction_id from booking session payload', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: {
          id: 'booking-1',
          session: {
            transaction_id: 'txn-123',
          },
        },
      },
    } as never);

    const result = await getBookingTransactionId('booking-1');

    expect(api.get).toHaveBeenCalledWith('/bookings/booking-1');
    expect(result.transaction_id).toBe('txn-123');
  });

  it('returns null transaction_id when payment is not confirmed', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: {
          id: 'booking-2',
          session: {
            transaction_id: null,
          },
        },
      },
    } as never);

    const result = await getBookingTransactionId('booking-2');

    expect(result.transaction_id).toBeNull();
  });

  it('handles flat disputes list response without pagination metadata', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'd1', transaction_id: 'tx-1', status: 'open' },
          { id: 'd2', transaction_id: 'tx-2', status: 'under_review' },
        ],
      },
    } as never);

    const result = await listDisputes();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('d1');
  });

  it('maps dispute statuses to required labels', () => {
    expect(getDisputeStatusLabel('open')).toBe('Under Review');
    expect(getDisputeStatusLabel('under_review')).toBe('Escalated');
    expect(getDisputeStatusLabel('resolved')).toBe('Resolved');
  });

  it('uploads file first and then posts evidence payload with file_url', async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({
        data: {
          data: {
            file_url: 'https://storage.example.com/evidence.png',
          },
        },
      } as never)
      .mockResolvedValueOnce({
        data: {
          data: { id: 'evidence-1' },
        },
      } as never);

    const file = new File(['proof'], 'proof.png', { type: 'image/png' });

    await uploadDisputeEvidence({
      disputeId: 'dispute-1',
      text_content: 'Attached screenshot proof.',
      file,
    });

    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/uploads',
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/disputes/dispute-1/evidence',
      {
        text_content: 'Attached screenshot proof.',
        file_url: 'https://storage.example.com/evidence.png',
      },
    );
  });
});
