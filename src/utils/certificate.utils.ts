import type { LearningCertificate } from '../types/learner.types';

/**
 * Public verification URL for employers / third parties (served by app route in production).
 */
export function getCertificateVerificationUrl(cert: LearningCertificate): string {
  if (typeof window === 'undefined') {
    return `/verify/certificate/${cert.verificationToken}`;
  }
  return `${window.location.origin}/verify/certificate/${cert.verificationToken}`;
}
