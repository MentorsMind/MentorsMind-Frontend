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
