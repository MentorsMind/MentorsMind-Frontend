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
