import api from './api';
import type { Session } from '../types';

export interface CreateBookingPayload {
  mentorId: string;
  scheduledAt: string;
  duration: number;
  asset: 'XLM' | 'USDC' | 'PYUSD';
  notes?: string;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Session> {
  const { data } = await api.post('/bookings', payload);
  return data.data;
}

export async function getBooking(id: string): Promise<Session> {
  const { data } = await api.get(`/bookings/${id}`);
  return data.data;
}

export async function listBookings(): Promise<Session[]> {
  const { data } = await api.get('/bookings');
  return data.data;
}

export async function confirmBooking(id: string): Promise<Session> {
  const { data } = await api.post(`/bookings/${id}/confirm`);
  return data.data;
}

export async function cancelBooking(id: string): Promise<Session> {
  const { data } = await api.delete(`/bookings/${id}`);
  return data.data;
}

export async function completeBooking(id: string): Promise<Session> {
  const { data } = await api.post(`/bookings/${id}/complete`);
  return data.data;
}
