import api from './api';
import type { EarningsApiResponse } from '../types/earnings.types';

export async function getEarnings(mentorId: string): Promise<EarningsApiResponse> {
  const { data } = await api.get(`/mentors/${mentorId}/earnings`);
  return data.data;
}
