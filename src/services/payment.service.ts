import api from './api';
import type { Payment, PaymentTransaction, PaymentHistoryResponse, PaymentDetailResponse, PaymentType, PaymentStatus } from '../types';

export interface InitiatePaymentPayload {
  bookingId: string;
  amount: number;
  asset: 'XLM' | 'USDC' | 'PYUSD';
  stellarTxHash?: string;
}

export interface PaymentHistoryFilters {
  types?: PaymentType[];
  statuses?: PaymentStatus[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export async function initiatePayment(payload: InitiatePaymentPayload): Promise<Payment> {
  const { data } = await api.post('/payments', payload);
  return data.data;
}

export async function getPayment(id: string): Promise<Payment> {
  const { data } = await api.get(`/payments/${id}`);
  return data.data;
}

export async function listPayments(): Promise<Payment[]> {
  const { data } = await api.get('/payments');
  return data.data;
}

export async function getPaymentStatus(id: string): Promise<{ status: string }> {
  const { data } = await api.get(`/payments/${id}/status`);
  return data.data;
}

export async function requestRefund(id: string): Promise<Payment> {
  const { data } = await api.post(`/payments/${id}/refund`);
  return data.data;
}

/**
 * Get payment history with filtering and cursor-based pagination
 */
export async function getPaymentHistory(filters: PaymentHistoryFilters = {}): Promise<PaymentHistoryResponse> {
  const params = new URLSearchParams();
  
  if (filters.types && filters.types.length > 0) {
    params.append('types', filters.types.join(','));
  }
  
  if (filters.statuses && filters.statuses.length > 0) {
    params.append('statuses', filters.statuses.join(','));
  }
  
  if (filters.dateFrom) {
    params.append('dateFrom', filters.dateFrom);
  }
  
  if (filters.dateTo) {
    params.append('dateTo', filters.dateTo);
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.cursor) {
    params.append('cursor', filters.cursor);
  }
  
  if (filters.limit) {
    params.append('limit', String(filters.limit));
  }

  const { data } = await api.get(`/payments/history?${params.toString()}`);
  return data.data;
}

/**
 * Get detailed payment information with full breakdown
 */
export async function getPaymentDetail(id: string): Promise<PaymentDetailResponse> {
  const { data } = await api.get(`/payments/${id}/detail`);
  return data.data;
}

/**
 * Retry a failed payment
 */
export async function retryPayment(id: string): Promise<Payment> {
  const { data } = await api.post(`/payments/${id}/retry`);
  return data.data;
}
/**
 * Get payment history with filtering and cursor-based pagination
 */
export async function getPaymentHistory(filters) {
  const params = new URLSearchParams();
  
  if (filters.types && filters.types.length > 0) {
    params.append("types", filters.types.join(","));
  }
  
  if (filters.statuses && filters.statuses.length > 0) {
    params.append("statuses", filters.statuses.join(","));
  }
  
  if (filters.dateFrom) {
    params.append("dateFrom", filters.dateFrom);
  }
  
  if (filters.dateTo) {
    params.append("dateTo", filters.dateTo);
  }
  
  if (filters.search) {
    params.append("search", filters.search);
  }
  
  if (filters.cursor) {
    params.append("cursor", filters.cursor);
  }
  
  if (filters.limit) {
    params.append("limit", String(filters.limit));
  }

  const { data } = await api.get(`/payments/history?${params.toString()}`);
  return data.data;
}

/**
 * Get detailed payment information with full breakdown
 */
export async function getPaymentDetail(id) {
  const { data } = await api.get(`/payments/${id}/detail`);
  return data.data;
}

/**
 * Retry a failed payment
 */
export async function retryPayment(id) {
  const { data } = await api.post(`/payments/${id}/retry`);
  return data.data;
}
