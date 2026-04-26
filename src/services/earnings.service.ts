import api from './api';
import type {
  EarningsApiResponse,
  MentorEarningsResponse,
  WalletEarningsResponse,
  GroupBy,
  DateRangeFilter,
} from '../types/earnings.types';

export interface GetEarningsOptions {
  groupBy?: GroupBy;
  from?: string;
  to?: string;
}

export async function getEarnings(
  mentorId: string,
  options?: GetEarningsOptions,
): Promise<EarningsApiResponse> {
  const params = new URLSearchParams();
  if (options?.groupBy) params.set('groupBy', options.groupBy);
  if (options?.from) params.set('from', options.from);
  if (options?.to) params.set('to', options.to);

  const query = params.toString();
  const url = query ? `/mentors/${mentorId}/earnings?${query}` : `/mentors/${mentorId}/earnings`;

  const { data } = await api.get(url);
  return data.data;
}

export async function getMentorEarnings(
  mentorId: string,
  options?: GetEarningsOptions,
): Promise<MentorEarningsResponse> {
  const params = new URLSearchParams();
  if (options?.groupBy) params.set('groupBy', options.groupBy);
  if (options?.from) params.set('from', options.from);
  if (options?.to) params.set('to', options.to);

  const query = params.toString();
  const url = query ? `/mentors/${mentorId}/earnings?${query}` : `/mentors/${mentorId}/earnings`;

  const { data } = await api.get(url);
  return data.data;
}

export async function getWalletEarnings(
  options?: DateRangeFilter,
): Promise<WalletEarningsResponse> {
  const params = new URLSearchParams();
  if (options?.from) params.set('from', options.from);
  if (options?.to) params.set('to', options.to);

  const query = params.toString();
  const url = query ? `/wallets/me/earnings?${query}` : '/wallets/me/earnings';

  const { data } = await api.get(url);
  return data.data;
}

