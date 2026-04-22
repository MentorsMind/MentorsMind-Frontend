import api from './api';
import type { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// ── MFA types (declared early so login() can reference LoginResult) ───────────

export interface MFASetupResponse {
  /** base64 DataURL, e.g. "data:image/png;base64,..." */
  qrCode: string;
  /** plain-text TOTP secret (for manual entry) */
  secret: string;
}

export interface MFAVerifySetupResponse {
  /** 8 one-time backup codes */
  backupCodes: string[];
}

export interface MFALoginResponse extends AuthResponse {
  mfa_required?: false;
}

export interface MFAChallengeRequired {
  mfa_required: true;
  /** Temporary token used only to complete the MFA challenge */
  mfa_token: string;
}

export type LoginResult = MFALoginResponse | MFAChallengeRequired;

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Login — may return a full session or an MFA challenge */
export async function login(email: string, password: string): Promise<LoginResult> {
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

export async function refreshToken(token: string): Promise<{ token: string }> {
  const { data } = await api.post('/auth/refresh', { refreshToken: token });
  return data.data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout').catch(() => {});
}

// ── MFA ───────────────────────────────────────────────────────────────────────

/** Initiate MFA setup — returns QR code DataURL and raw secret */
export async function mfaSetup(): Promise<MFASetupResponse> {
  const { data } = await api.post('/auth/mfa/setup');
  return data.data;
}

/** Confirm setup by submitting the first TOTP code — returns backup codes */
export async function mfaVerifySetup(totp: string): Promise<MFAVerifySetupResponse> {
  const { data } = await api.post('/auth/mfa/verify-setup', { totp });
  return data.data;
}

/** Disable MFA (requires current TOTP or backup code for confirmation) */
export async function mfaDisable(totp: string): Promise<void> {
  await api.post('/auth/mfa/disable', { totp });
}

/** Complete the MFA challenge after login when mfa_required === true */
export async function mfaVerify(mfa_token: string, totp: string): Promise<AuthResponse> {
  const { data } = await api.post('/auth/mfa/verify', { mfa_token, totp });
  return data.data;
}
