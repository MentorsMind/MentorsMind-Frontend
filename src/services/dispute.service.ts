import api from './api';

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | string;

export interface DisputeRecord {
  id: string;
  transaction_id: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDisputePayload {
  transaction_id: string;
  reason: string;
  description: string;
}

export interface BookingDetailTransaction {
  transaction_id: string | null;
}

export const DISPUTE_STATUS_LABELS: Record<string, string> = {
  open: 'Under Review',
  under_review: 'Escalated',
  resolved: 'Resolved',
};

export function getDisputeStatusLabel(status: string): string {
  return DISPUTE_STATUS_LABELS[status] ?? status;
}

function pickTransactionId(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;

  const direct = record.transaction_id;
  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct;
  }

  const session = record.session;
  if (session && typeof session === 'object') {
    const nested = (session as Record<string, unknown>).transaction_id;
    if (typeof nested === 'string' && nested.trim().length > 0) {
      return nested;
    }
    if (nested === null) {
      return null;
    }
  }

  if (direct === null) {
    return null;
  }

  return null;
}

export async function getBookingTransactionId(
  bookingId: string,
): Promise<BookingDetailTransaction> {
  const { data } = await api.get(`/bookings/${bookingId}`);
  const payload = (data?.data ?? data) as unknown;

  return {
    transaction_id: pickTransactionId(payload),
  };
}

export async function createDispute(
  payload: CreateDisputePayload,
): Promise<DisputeRecord> {
  const { data } = await api.post('/disputes', payload);
  return (data?.data ?? data) as DisputeRecord;
}

export async function listDisputes(): Promise<DisputeRecord[]> {
  const { data } = await api.get('/disputes');
  const payload = (data?.data ?? data) as unknown;

  if (Array.isArray(payload)) {
    return payload as DisputeRecord[];
  }

  if (payload && typeof payload === 'object') {
    const maybeNested = (payload as Record<string, unknown>).data;
    if (Array.isArray(maybeNested)) {
      return maybeNested as DisputeRecord[];
    }
  }

  return [];
}

export async function uploadDisputeFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const payload = (data?.data ?? data) as Record<string, unknown>;
  const fileUrl = payload.file_url ?? payload.url;
  if (typeof fileUrl !== 'string' || fileUrl.trim().length === 0) {
    throw new Error('Upload did not return a file URL');
  }

  return fileUrl;
}

export async function uploadDisputeEvidence(params: {
  disputeId: string;
  text_content: string;
  file: File;
}): Promise<unknown> {
  const file_url = await uploadDisputeFile(params.file);
  const payload = {
    text_content: params.text_content,
    file_url,
  };

  const { data } = await api.post(`/disputes/${params.disputeId}/evidence`, payload);
  return data?.data ?? data;
}

export function getDisputeStatusColor(status: string): 'warning' | 'info' | 'success' | 'default' {
  switch (status) {
    case 'open':
      return 'warning';
    case 'under_review':
      return 'info';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'default';
    default:
      return 'default';
  }
}

export async function getDispute(id: string): Promise<DisputeRecord> {
  const { data } = await api.get(`/disputes/${id}`);
  return (data?.data ?? data) as DisputeRecord;
}

export async function listDisputesForBooking(bookingId: string): Promise<DisputeRecord[]> {
  const { data } = await api.get(`/disputes?booking_id=${bookingId}`);
  const payload = (data?.data ?? data) as unknown;

  if (Array.isArray(payload)) {
    return payload as DisputeRecord[];
  }

  if (payload && typeof payload === 'object') {
    const maybeNested = (payload as Record<string, unknown>).data;
    if (Array.isArray(maybeNested)) {
      return maybeNested as DisputeRecord[];
    }
  }

  return [];
}
