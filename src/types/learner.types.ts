import { SkillLevel } from './index';
import { AchievementBadge } from './session.types';

/** Soulbound learning certificate — on-chain attestation of completed mentorship. */
export type CertificateVerificationStatus = 'verified' | 'revoked';

export interface LearningCertificate {
  id: string;
  skillName: string;
  mentorName: string;
  sessionsCompleted: number;
  /** ISO 8601 issue timestamp */
  issuedAt: string;
  status: CertificateVerificationStatus;
  /** Soroban / contract identifier (testnet/mainnet context from env) */
  contractId?: string;
  /** Issuance transaction hash for Stellar Expert */
  mintTxHash?: string;
  /** Stable id embedded in shareable verification URLs */
  verificationToken: string;
  /** Optional mentor public key shown in detail modal */
  mentorPublicKey?: string;
}

export type LearningStyle = 'visual' | 'auditory' | 'reading/writing' | 'kinesthetic';
export type ProfileVisibility = 'public' | 'mentors-only' | 'private';

export interface LearnerProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  introduction?: string;
  learningGoals: string[]; // tags
  skillLevels: SkillLevel[];
  interests: string[];
  preferredLearningStyle: LearningStyle;
  timezone: string;
  language: string;
  visibility: ProfileVisibility;
  achievements: AchievementBadge[];
}
