import api from './api';
import type { Mentor, Session, Review } from '../types';

// GET /mentors — cursor-based pagination
// Response shape: { data: { data: Mentor[], next_cursor: string | null, has_more: boolean, total: number } }
export interface MentorSearchParams {
  q?: string;
  skills?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  cursor?: string;
  limit?: number;
}

export interface CursorPaginatedMentors {
  mentors: Mentor[];
  next_cursor: string | null;
  has_more: boolean;
  total: number;
}

export async function searchMentors(params: MentorSearchParams = {}): Promise<CursorPaginatedMentors> {
  const { data } = await api.get('/mentors', { params });
  // Response: { data: { data: [...], next_cursor, has_more, total } }
  const payload = data.data;
  return {
    mentors: payload.data,
    next_cursor: payload.next_cursor ?? null,
    has_more: payload.has_more ?? false,
    total: payload.total ?? 0,
  };
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

export interface VerificationStatus {
  verificationStatus: 'approved' | 'pending' | 'rejected';
}

export async function getMentorVerificationStatus(id: string): Promise<VerificationStatus> {
  const { data } = await api.get(`/mentors/${id}/verification-status`);
  return data.data;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  bio: string;
  avatarUrl?: string;
  skills: string[];
  languages: string[];
  hourlyRate: number;
  currency: string;
  rating: number;
  reviewCount: number;
  sessionCount: number;
  timezone: string;
  joinDate: string;
}

export async function getPublicUserProfile(id: string): Promise<PublicUserProfile> {
  const { data } = await api.get(`/users/${id}/public`);
  return data.data;
}

export interface RatingSummary {
  average: number;
  total: number;
  breakdown: Array<{ stars: number; count: number }>;
}

export async function getMentorRatingSummary(id: string): Promise<RatingSummary> {
  const { data } = await api.get(`/mentors/${id}/rating-summary`);
  return data.data;
}

export interface AvailabilitySlot {
  date: string;
  duration: number;
}

export async function getMentorAvailability(id: string): Promise<AvailabilitySlot[]> {
  const { data } = await api.get(`/mentors/${id}/availability`);
  return data.data;
}
