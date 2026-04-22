import api from './api';
import type { Mentor, Session, Review } from '../types';

export interface MentorSearchParams {
  q?: string;
  skills?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedMentors {
  mentors: Mentor[];
  total: number;
  page: number;
  limit: number;
}

export async function searchMentors(params: MentorSearchParams = {}): Promise<PaginatedMentors> {
  const { data } = await api.get('/mentors', { params });
  return data.data;
}

export async function getMentor(id: string): Promise<Mentor> {
  const { data } = await api.get(`/mentors/${id}`);
  return data.data;
}

export async function getMentorSessions(id: string): Promise<Session[]> {
  const { data } = await api.get(`/mentors/${id}/sessions`);
  return data.data;
}

export async function getMentorReviews(id: string): Promise<Review[]> {
  const { data } = await api.get(`/mentors/${id}/reviews`);
  return data.data;
}

export async function updateMentorProfile(id: string, payload: Partial<Mentor>): Promise<Mentor> {
  const { data } = await api.put(`/mentors/${id}`, payload);
  return data.data;
}

export interface AvailabilityPayload {
  slots: import('../hooks/useAvailability').TimeSlot[];
  timezone: string;
}

export interface AvailabilityResponse extends AvailabilityPayload {
  syncedCalendars?: string[];
}

export async function getAvailability(mentorId: string): Promise<AvailabilityResponse> {
  const { data } = await api.get(`/mentors/${mentorId}/availability`);
  return data.data;
}

export async function saveAvailability(mentorId: string, payload: AvailabilityPayload): Promise<void> {
  await api.post(`/mentors/${mentorId}/availability`, payload);
}

export async function syncCalendar(mentorId: string, provider: 'google' | 'outlook'): Promise<void> {
  await api.post(`/mentors/${mentorId}/calendar-sync`, { provider });
}
