import api from './api';
import type { Payment } from '../types';

export interface InitiatePaymentPayload {
  bookingId: string;
  amount: number;
  asset: 'XLM' | 'USDC' | 'PYUSD';
  stellarTxHash?: string;
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
