/**
 * Types for mentor document verification system
 */

export type DocumentType = 'government_id' | 'professional_credentials' | 'linkedin_profile';
export type VerificationStatus = 'not_started' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'more_info_required';
export type FileFormat = 'PDF' | 'JPG' | 'PNG';

export interface VerificationDocument {
  id: string;
  type: DocumentType;
  status: VerificationStatus;
  fileName?: string;
  fileSize?: number;
  submittedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  additionalInfoRequest?: string;
  reviewedBy?: string;
  fileUrl?: string;
}

export interface VerificationTimeline {
  stage: VerificationStatus;
  timestamp?: string;
  message: string;
}

export interface MentorVerificationData {
  mentorId: string;
  documents: VerificationDocument[];
  overallStatus: 'not_started' | 'in_progress' | 'approved' | 'rejected' | 'more_info_required';
  timeline: VerificationTimeline[];
  allDocumentsApproved: boolean;
  verificationBadgeEligible: boolean;
}

// ---------------------------------------------------------------------------
// Presigned URL Upload Flow
// ---------------------------------------------------------------------------

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
  expiresAt: string;
}

export interface VerificationSubmitPayload {
  documentType: DocumentType;
  documentUrl: string;
  credentialUrl?: string;
  linkedinUrl?: string;
  additionalNotes?: string;
}

export interface VerificationSubmitResponse {
  success: boolean;
  documentId: string;
  status: VerificationStatus;
  message: string;
}

// ---------------------------------------------------------------------------
// Legacy types (kept for backward compatibility)
// ---------------------------------------------------------------------------

export interface DocumentUploadRequest {
  file: File;
  documentType: DocumentType;
  metadata?: {
    linkedinUrl?: string;
  };
}

export interface DocumentUploadProgress {
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
}

export interface DocumentUploadResponse {
  success: boolean;
  documentId: string;
  status: VerificationStatus;
  message: string;
}

/**
 * Constants for document types
 */
export const DOCUMENT_TYPES: Record<DocumentType, {
  label: string;
  description: string;
  requiredFormats: FileFormat[];
  maxSize: number; // in bytes
}> = {
  government_id: {
    label: 'Government ID',
    description: 'Valid passport, driver\'s license, or national ID',
    requiredFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  professional_credentials: {
    label: 'Professional Credentials',
    description: 'Certifications, degrees, or licenses (e.g., teaching certificate, relevant degree)',
    requiredFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  linkedin_profile: {
    label: 'LinkedIn Profile URL',
    description: 'Link to your LinkedIn profile for professional verification',
    requiredFormats: [] as FileFormat[], // No file format needed
    maxSize: 0, // Not applicable
  },
};

/**
 * Status timeline messages
 */
export const STATUS_MESSAGES: Record<VerificationStatus, string> = {
  not_started: 'Not started',
  submitted: 'Submitted for review',
  under_review: 'Under review by our team',
  approved: 'Verified and approved',
  rejected: 'Review required - resubmit needed',
  more_info_required: 'Additional information needed',
};

/**
 * Verification status colors for UI
 */
export const STATUS_COLORS: Record<VerificationStatus, {
  bg: string;
  text: string;
  badge: string;
}> = {
  not_started: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-800',
  },
  submitted: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
  },
  under_review: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
  },
  approved: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800',
  },
  more_info_required: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800',
  },
};
