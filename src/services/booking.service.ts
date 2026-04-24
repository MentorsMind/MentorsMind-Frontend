import api from './api';
import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import type { Session } from '../types';
import type { BookingSessionType } from "../types/session.types";
import { request } from "../utils/request.utils";

export interface CreateBookingPayload {
  mentorId: string;
  sessionType: BookingSessionType;
  duration: number;
  notes: string;
  slotStart: string;
  slotEnd: string;
  timezone: string;
  totalAmount: number;
  currency: string;
  paymentTransactionHash?: string;
}

export interface CreateBookingResponse {
  id: string;
  status: string;
}

export default class BookingService {
  async create(payload: CreateBookingPayload, opts?: RequestOptions) {
    return request<CreateBookingResponse>(
      {
        method: "POST",
        url: `${apiConfig.url.sessions}/bookings`,
        data: payload,
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
