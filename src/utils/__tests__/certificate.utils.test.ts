import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCertificateVerificationUrl } from '../certificate.utils';
import type { LearningCertificate } from '../../types/learner.types';

const baseCert: LearningCertificate = {
  id: 'c1',
  skillName: 'Test',
  mentorName: 'Mentor',
  sessionsCompleted: 1,
  issuedAt: '2025-01-01T00:00:00.000Z',
  status: 'verified',
  verificationToken: 'tok-abc',
};

describe('getCertificateVerificationUrl', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://app.example' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds absolute verification URL with token', () => {
    expect(getCertificateVerificationUrl(baseCert)).toBe(
      'https://app.example/verify/certificate/tok-abc',
    );
  });
});
