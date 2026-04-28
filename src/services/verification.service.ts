/**
 * Verification service for document upload and status tracking
 */

import api from './api.client';
import type {
  MentorVerificationData,
  VerificationDocument,
  PresignedUrlRequest,
  PresignedUrlResponse,
  VerificationSubmitPayload,
  VerificationSubmitResponse,
  DocumentUploadRequest,
  DocumentUploadResponse,
} from '../types/verification.types';
import { DOCUMENT_TYPES } from '../types/verification.types';

// Re-export for convenience
export { DOCUMENT_TYPES };

// ---------------------------------------------------------------------------
// Presigned URL Flow (new)
// ---------------------------------------------------------------------------

/**
 * Get a presigned URL for direct upload to S3/GCS
 */
export async function getPresignedUrl(
  request: PresignedUrlRequest,
): Promise<PresignedUrlResponse> {
  const { data } = await api.get('/uploads/presigned-url', {
    params: request,
  });
  return data.data;
}

/**
 * Upload file directly to S3/GCS using presigned URL.
 * Uses XMLHttpRequest for reliable upload progress tracking.
 */
export function uploadToPresignedUrl(
  file: File,
  presignedUrl: string,
  onProgress?: (percentage: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', presignedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed due to network error'));
    xhr.onabort = () => reject(new Error('Upload was cancelled'));

    xhr.send(file);
  });
}

/**
 * Submit verification using URLs (not file blobs)
 */
export async function submitVerification(
  payload: VerificationSubmitPayload,
): Promise<VerificationSubmitResponse> {
  const { data } = await api.post('/mentors/verification/submit', payload);
  return data.data;
}

/**
 * Get full verification status for the authenticated mentor
 * (includes sensitive fields: rejection_reason, additional_info_request, reviewed_by)
 */
export async function getMyVerificationStatus(): Promise<MentorVerificationData> {
  const { data } = await api.get('/mentors/me/verification-status');
  return data.data;
}

// ---------------------------------------------------------------------------
// Public / Legacy Endpoints
// ---------------------------------------------------------------------------

/**
 * Get verification status for a mentor (public endpoint — strips sensitive fields)
 */
export async function getMentorVerificationStatus(
  mentorId: string,
): Promise<MentorVerificationData> {
  const { data } = await api.get(`/mentors/${mentorId}/verification-status`);
  return data.data;
}

// ---------------------------------------------------------------------------
// Legacy direct upload (deprecated, kept for backward compatibility)
// ---------------------------------------------------------------------------

/**
 * Upload a verification document directly via multipart form-data
 * Supports both file uploads and URL submissions (for LinkedIn)
 */
export async function uploadVerificationDocument(
  mentorId: string,
  request: DocumentUploadRequest,
  onUploadProgress?: (progressEvent: any) => void,
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
    },
  );

  return data.data;
}

/**
 * Resubmit a rejected document (legacy)
 */
export async function resubmitDocument(
  mentorId: string,
  request: DocumentUploadRequest,
  onUploadProgress?: (progressEvent: any) => void,
): Promise<DocumentUploadResponse> {
  return uploadVerificationDocument(mentorId, request, onUploadProgress);
}

/**
 * Get a specific verification document (for viewing/downloading)
 */
export async function getVerificationDocument(
  mentorId: string,
  documentId: string,
): Promise<VerificationDocument> {
  const { data } = await api.get(`/mentors/${mentorId}/verification/${documentId}`);
  return data.data;
}

/**
 * Download a verification document
 */
export async function downloadVerificationDocument(
  mentorId: string,
  documentId: string,
): Promise<Blob> {
  const response = await api.get(
    `/mentors/${mentorId}/verification/${documentId}/download`,
    { responseType: 'blob' },
  );
  return response.data;
}

/**
 * Cancel/withdraw a document submission (if allowed)
 */
export async function withdrawDocument(
  mentorId: string,
  documentId: string,
): Promise<void> {
  await api.delete(`/mentors/${mentorId}/verification/${documentId}`);
}

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  acceptedFormats: string[],
  maxSize: number,
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
