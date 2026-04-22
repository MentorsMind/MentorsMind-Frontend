import api from './api';
import type { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: 'mentor' | 'learner'
): Promise<AuthResponse> {
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data.data;
}

export async function refreshToken(refreshToken: string): Promise<{ token: string }> {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data.data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout').catch(() => {});
}
