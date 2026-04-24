/**
 * Verification service for document upload and status tracking
 */

import api from './api.client';
import type {
  MentorVerificationData,
  DocumentUploadRequest,
  DocumentUploadResponse,
  VerificationDocument,
} from '../types/verification.types';
import { DOCUMENT_TYPES } from '../types/verification.types';

// Re-export for convenience
export { DOCUMENT_TYPES };

/**
 * Get verification status for a mentor
 */
export async function getMentorVerificationStatus(
  mentorId: string
): Promise<MentorVerificationData> {
  const { data } = await api.get(`/mentors/${mentorId}/verification-status`);
  return data.data;
}

/**
 * Upload a verification document
 * Supports both file uploads and URL submissions (for LinkedIn)
 */
export async function uploadVerificationDocument(
  mentorId: string,
  request: DocumentUploadRequest,
  onUploadProgress?: (progressEvent: ProgressEvent) => void
): Promise<DocumentUploadResponse> {
  const formData = new FormData();

  if (request.documentType === 'linkedin_profile') {
    // For LinkedIn profile, submit URL directly
    formData.append('documentType', request.documentType);
    formData.append('linkedinUrl', request.metadata?.linkedinUrl || '');
  } else {
    // For file uploads (government ID and professional credentials)
    formData.append('file', request.file);
    formData.append('documentType', request.documentType);
  }

  const { data } = await api.post(
    `/mentors/${mentorId}/verify`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }
  );

  return data.data;
}

/**
 * Resubmit a rejected document
 */
export async function resubmitDocument(
  mentorId: string,
  request: DocumentUploadRequest,
  onUploadProgress?: (progressEvent: ProgressEvent) => void
): Promise<DocumentUploadResponse> {
  return uploadVerificationDocument(mentorId, request, onUploadProgress);
}

/**
 * Get a specific verification document (for viewing/downloading)
 */
export async function getVerificationDocument(
  mentorId: string,
  documentId: string
): Promise<VerificationDocument> {
  const { data } = await api.get(`/mentors/${mentorId}/verification/${documentId}`);
  return data.data;
}

/**
 * Download a verification document
 */
export async function downloadVerificationDocument(
  mentorId: string,
  documentId: string
): Promise<Blob> {
  const response = await api.get(
    `/mentors/${mentorId}/verification/${documentId}/download`,
    { responseType: 'blob' }
  );
  return response.data;
}

/**
 * Cancel/withdraw a document submission (if allowed)
 */
export async function withdrawDocument(
  mentorId: string,
  documentId: string
): Promise<void> {
  await api.delete(`/mentors/${mentorId}/verification/${documentId}`);
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  acceptedFormats: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  // Check file size
  if (maxSize > 0 && file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit`,
    };
  }

  // Check file format
  const fileExtension = file.name.split('.').pop()?.toUpperCase() || '';
  if (acceptedFormats.length > 0 && !acceptedFormats.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file format. Accepted: ${acceptedFormats.join(', ')}`,
    };
  }

  // Check MIME type for additional security
  const mimeType = file.type;
  const acceptedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  if (mimeType && !acceptedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PDF, JPG, or PNG files.',
    };
  }

  return { valid: true };
}

/**
 * Validate LinkedIn URL
 */
export function validateLinkedInUrl(url: string): { valid: boolean; error?: string } {
  try {
    const linkedinUrl = new URL(url);
    if (!linkedinUrl.hostname.includes('linkedin.com')) {
      return {
        valid: false,
        error: 'Please enter a valid LinkedIn URL',
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid URL',
    };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
