import api from './api';
import type { RequestOptions } from "../types/api.types";
import type { Session } from '../types';
import { request } from "../utils/request.utils";

export interface CreateBookingPayload {
  mentorId: string;
  scheduledAt: string; // ISO 8601 string in UTC
  durationMinutes: number; // 15, 30, 45, 60, 90, 120
  topic: string;
  notes?: string;
}

export interface CreateBookingResponse {
  id: string;
  status: string;
}

export default class BookingService {
  async create(payload: CreateBookingPayload, opts?: RequestOptions & { idempotencyKey?: string }) {
    const headers: Record<string, string> = {};
    
    // Add Idempotency-Key header if provided
    if (opts?.idempotencyKey) {
      headers['Idempotency-Key'] = opts.idempotencyKey;
    }

    return request<CreateBookingResponse>(
      {
        method: "POST",
        url: "/bookings", // Use direct bookings endpoint as per issue description
        data: payload,
        headers,
      },
      opts,
    );
  }
}

export async function getBooking(id: string): Promise<Session> {
  const { data } = await api.get(`/bookings/${id}`);
  return data.data;
}

export async function listBookings(params?: ListBookingsParams): Promise<Session[]> {
  const { data } = await api.get('/bookings', { params });
  return data.data;
}

export async function listBookingsPaged(params?: ListBookingsParams): Promise<BookingsPage> {
  const { data } = await api.get('/bookings', { params: { ...params, limit: params?.limit ?? 10 } });
  return data.data;
}

export async function cancelBooking(id: string): Promise<Session> {
  const { data } = await api.delete(`/bookings/${id}`);
  return data.data;
}

export async function regenerateMeetingLink(id: string): Promise<Session> {
  const { data } = await api.post(`/bookings/${id}/meeting-link/regenerate`);
  return data.data ?? data;
}

export async function completeBooking(id: string): Promise<Session> {
  const { data } = await api.post(`/bookings/${id}/complete`);
  return data.data;
}
