/**
 * WebAuthn / Passkey service
 *
 * Wraps the browser's Credential Management API (navigator.credentials) and
 * communicates with the backend to register and authenticate passkeys.
 *
 * The private key NEVER leaves the device – only the public key is sent to
 * the server during registration.
 */

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PasskeyDevice {
  id: string;
  /** Human-readable device / authenticator name */
  name: string;
  /** ISO-8601 date string */
  registeredAt: string;
  /** Last time this passkey was used to sign in */
  lastUsedAt?: string;
}

export interface RegistrationOptions {
  challenge: string; // base64url-encoded
  rpId: string;
  rpName: string;
  userId: string; // base64url-encoded
  userName: string;
  userDisplayName: string;
  timeout: number;
  attestation: AttestationConveyancePreference;
  authenticatorSelection: AuthenticatorSelectionCriteria;
  excludeCredentials: { id: string; type: 'public-key' }[];
}

export interface AuthenticationOptions {
  challenge: string; // base64url-encoded
  rpId: string;
  timeout: number;
  allowCredentials: { id: string; type: 'public-key' }[];
  userVerification: UserVerificationRequirement;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a base64url string to an ArrayBuffer */
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

/** Convert an ArrayBuffer to a base64url string */
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ─── Support detection ────────────────────────────────────────────────────────

/**
 * Returns true when the browser supports WebAuthn and the platform
 * authenticator (Touch ID, Face ID, Windows Hello, etc.) is available.
 */
export async function isBiometricSupported(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !window.PublicKeyCredential ||
    typeof navigator.credentials?.create !== 'function'
  ) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Step 1 – fetch a registration challenge from the server.
 */
async function getRegistrationOptions(): Promise<RegistrationOptions> {
  const { data } = await api.post('/auth/passkeys/register/options');
  return data.data as RegistrationOptions;
}

/**
 * Step 2 – send the signed credential back to the server for verification and
 * storage (public key only).
 */
async function verifyRegistration(
  credential: PublicKeyCredential,
  deviceName: string,
): Promise<PasskeyDevice> {
  const response = credential.response as AuthenticatorAttestationResponse;

  const payload = {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    deviceName,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      attestationObject: bufferToBase64url(response.attestationObject),
    },
  };

  const { data } = await api.post('/auth/passkeys/register/verify', payload);
  return data.data as PasskeyDevice;
}

/**
 * Full registration flow:
 * 1. Fetch challenge from server
 * 2. Prompt the platform authenticator (fingerprint / Face ID)
 * 3. Send signed credential to server
 *
 * @param deviceName  Label shown in the "Manage passkeys" list
 */
export async function registerPasskey(deviceName: string): Promise<PasskeyDevice> {
  const options = await getRegistrationOptions();

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: base64urlToBuffer(options.challenge),
    rp: { id: options.rpId, name: options.rpName },
    user: {
      id: base64urlToBuffer(options.userId),
      name: options.userName,
      displayName: options.userDisplayName,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },  // ES256
      { type: 'public-key', alg: -257 }, // RS256
    ],
    timeout: options.timeout,
    attestation: options.attestation,
    authenticatorSelection: options.authenticatorSelection,
    excludeCredentials: options.excludeCredentials.map(c => ({
      id: base64urlToBuffer(c.id),
      type: c.type,
    })),
  };

  const credential = await navigator.credentials.create({ publicKey });
  if (!credential) throw new Error('No credential returned by authenticator.');

  return verifyRegistration(credential as PublicKeyCredential, deviceName);
}

// ─── Authentication ───────────────────────────────────────────────────────────

/**
 * Step 1 – fetch an authentication challenge from the server.
 */
async function getAuthenticationOptions(): Promise<AuthenticationOptions> {
  const { data } = await api.post('/auth/passkeys/authenticate/options');
  return data.data as AuthenticationOptions;
}

/**
 * Step 2 – send the signed assertion to the server for verification.
 * Returns the same token shape as a regular login.
 */
async function verifyAuthentication(
  credential: PublicKeyCredential,
): Promise<{ user: import('../types').User; token: string; refreshToken: string }> {
  const response = credential.response as AuthenticatorAssertionResponse;

  const payload = {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      authenticatorData: bufferToBase64url(response.authenticatorData),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
    },
  };

  const { data } = await api.post('/auth/passkeys/authenticate/verify', payload);
  return data.data;
}

/**
 * Full authentication flow:
 * 1. Fetch challenge from server
 * 2. Prompt the platform authenticator
 * 3. Send signed assertion to server
 */
export async function authenticateWithPasskey(): Promise<{
  user: import('../types').User;
  token: string;
  refreshToken: string;
}> {
  const options = await getAuthenticationOptions();

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: base64urlToBuffer(options.challenge),
    rpId: options.rpId,
    timeout: options.timeout,
    allowCredentials: options.allowCredentials.map(c => ({
      id: base64urlToBuffer(c.id),
      type: c.type,
    })),
    userVerification: options.userVerification,
  };

  const credential = await navigator.credentials.get({ publicKey });
  if (!credential) throw new Error('No credential returned by authenticator.');

  return verifyAuthentication(credential as PublicKeyCredential);
}

// ─── Passkey management ───────────────────────────────────────────────────────

/** Fetch all passkeys registered for the current user. */
export async function listPasskeys(): Promise<PasskeyDevice[]> {
  const { data } = await api.get('/auth/passkeys');
  return data.data as PasskeyDevice[];
}

/** Remove a passkey by its server-side ID. */
export async function removePasskey(passkeyId: string): Promise<void> {
  await api.delete(`/auth/passkeys/${passkeyId}`);
}
