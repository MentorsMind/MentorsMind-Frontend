import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import type { PaymentQuote } from "../types/payment.types";
import { request } from "../utils/request.utils";
import api from "./api.client";

export default class PaymentService {
  async getQuote(amount: number, assetCode: string, opts?: RequestOptions) {
    return request<PaymentQuote>(
      { method: "GET", url: `${apiConfig.url.payments}/quote`, params: { amount, assetCode } },
      opts,
    );
  }

  async pay(
    payload: { amount: number; quoteId: string; assetCode: string },
    idempotencyKey: string,
    opts?: RequestOptions,
  ) {
    const res = await api({
      method: "POST",
      url: apiConfig.url.payments,
      data: payload,
      headers: { "Idempotency-Key": idempotencyKey },
      signal: opts?.signal,
    });

    return {
      data: res.data as { status: string; transactionHash?: string },
      replayed: res.headers["x-idempotency-replayed"] === "true",
    };
  }
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

export interface PaymentRequest {
  sessionId: string;
  mentorId: string;
  amount: number;
  assetCode: string;
  transactionHash: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: string;
  transactionHash?: string;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
}

/**
 * Create a new payment record
 */
export async function createPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const { data } = await api.post('/payments/create', request);
  return data.data;
}

/**
 * Poll payment status until confirmed or failed
 */
export async function pollPaymentStatus(
  paymentId: string,
  onStatusUpdate?: (status: PaymentStatusResponse) => void,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<PaymentStatusResponse> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const { data } = await api.get(`/payments/${paymentId}/status`);
      const status: PaymentStatusResponse = data.data;
      
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
      
      if (status.status === 'confirmed' || status.status === 'failed') {
        return status;
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    } catch (error) {
      console.error('Error polling payment status:', error);
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Payment status polling failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new Error('Payment confirmation timeout');
}
