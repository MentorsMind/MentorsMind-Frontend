import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPresignedUrl,
  uploadToPresignedUrl,
  submitVerification,
  getMyVerificationStatus,
  getMentorVerificationStatus,
  validateFile,
  validateLinkedInUrl,
} from '../services/verification.service';
import type {
  MentorVerificationData,
  DocumentType,
  VerificationSubmitPayload,
  PresignedUrlResponse,
} from '../types/verification.types';
import { DOCUMENT_TYPES } from '../types/verification.types';

export interface UploadState {
  file: File | null;
  presignedData: PresignedUrlResponse | null;
  progress: number;
  status: 'idle' | 'requesting_url' | 'uploading' | 'uploaded' | 'error';
  error: string | null;
  publicUrl: string | null;
}

export interface UseVerificationReturn {
  myStatus: MentorVerificationData | null;
  publicStatus: MentorVerificationData | null;
  loading: boolean;
  error: string | null;
  uploads: Record<DocumentType, UploadState>;
  linkedInUrl: string;
  setLinkedInUrl: (url: string) => void;
  selectedDocumentType: DocumentType | null;
  setSelectedDocumentType: (type: DocumentType | null) => void;
  selectFile: (documentType: DocumentType, file: File | null) => { valid: boolean; error?: string };
  uploadFile: (documentType: DocumentType) => Promise<string | null>;
  submit: (payload: Omit<VerificationSubmitPayload, 'documentUrl' | 'credentialUrl'>) => Promise<void>;
  resubmit: (documentType: DocumentType) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

type UploadsState = Record<DocumentType, UploadState>;

const INITIAL_UPLOAD_STATE: UploadState = {
  file: null,
  presignedData: null,
  progress: 0,
  status: 'idle',
  error: null,
  publicUrl: null,
};

export function useVerification(mentorId?: string): UseVerificationReturn {
  const [myStatus, setMyStatus] = useState<MentorVerificationData | null>(null);
  const [publicStatus, setPublicStatus] = useState<MentorVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploads, setUploads] = useState<UploadsState>({
    government_id: { ...INITIAL_UPLOAD_STATE },
    professional_credentials: { ...INITIAL_UPLOAD_STATE },
    linkedin_profile: { ...INITIAL_UPLOAD_STATE },
  });

  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);

  const fetchedRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [myData, publicData] = await Promise.all([
        getMyVerificationStatus(),
        mentorId ? getMentorVerificationStatus(mentorId) : Promise.resolve(null),
      ]);
      setMyStatus(myData);
      setPublicStatus(publicData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load verification status';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [mentorId]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchStatus();
    }
  }, [fetchStatus]);

  const selectFile = useCallback((documentType: DocumentType, file: File | null) => {
    if (!file) {
      setUploads((prev: UploadsState) => ({
        ...prev,
        [documentType]: { ...INITIAL_UPLOAD_STATE },
      }));
      return { valid: true };
    }

    const config = DOCUMENT_TYPES[documentType];
    const validation = validateFile(
      file,
      config.requiredFormats as string[],
      config.maxSize,
    );

    if (!validation.valid) {
      setUploads((prev: UploadsState) => ({
        ...prev,
        [documentType]: {
          ...INITIAL_UPLOAD_STATE,
          file,
          error: validation.error || 'Invalid file',
          status: 'error',
        },
      }));
      return { valid: false, error: validation.error };
    }

    setUploads((prev: UploadsState) => ({
      ...prev,
      [documentType]: {
        ...INITIAL_UPLOAD_STATE,
        file,
        status: 'idle',
        error: null,
      },
    }));

    return { valid: true };
  }, []);

  const uploadFile = useCallback(async (documentType: DocumentType): Promise<string | null> => {
    const uploadState = uploads[documentType];
    const file = uploadState.file;

    if (!file) {
      setUploads((prev: UploadsState) => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          error: 'No file selected',
          status: 'error',
        },
      }));
      return null;
    }

    setUploads((prev: UploadsState) => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        status: 'requesting_url',
        progress: 0,
        error: null,
      },
    }));

    let presignedData: PresignedUrlResponse;
    try {
      presignedData = await getPresignedUrl({
        fileName: file.name,
        fileType: file.type,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get upload URL';
      setUploads((prev: UploadsState) => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          status: 'error',
          error: message,
        },
      }));
      return null;
    }

    setUploads((prev: UploadsState) => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        presignedData,
        status: 'uploading',
        progress: 0,
      },
    }));

    try {
      await uploadToPresignedUrl(file, presignedData.presignedUrl, (percentage: number) => {
        setUploads((prev: UploadsState) => ({
          ...prev,
          [documentType]: {
            ...prev[documentType],
            progress: percentage,
          },
        }));
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setUploads((prev: UploadsState) => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          status: 'error',
          error: message,
        },
      }));
      return null;
    }

    setUploads((prev: UploadsState) => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        status: 'uploaded',
        progress: 100,
        publicUrl: presignedData.publicUrl,
      },
    }));

    return presignedData.publicUrl;
  }, [uploads]);

  const submit = useCallback(
    async (payload: Omit<VerificationSubmitPayload, 'documentUrl' | 'credentialUrl'>) => {
      if (!selectedDocumentType) {
        throw new Error('Please select a document type');
      }

      const uploadState = uploads[selectedDocumentType];

      let documentUrl: string | null = uploadState.publicUrl;
      if (selectedDocumentType === 'linkedin_profile') {
        const validation = validateLinkedInUrl(linkedInUrl);
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid LinkedIn URL');
        }
        documentUrl = linkedInUrl;
      }

      if (!documentUrl) {
        throw new Error('Please upload the file first');
      }

      const fullPayload: VerificationSubmitPayload = {
        ...payload,
        documentType: selectedDocumentType,
        documentUrl: documentUrl!,
        credentialUrl: uploadState.publicUrl || undefined,
      };

      await submitVerification(fullPayload);
      await fetchStatus();
    },
    [selectedDocumentType, uploads, linkedInUrl, fetchStatus],
  );

  const resubmit = useCallback(
    async (documentType: DocumentType) => {
      setSelectedDocumentType(documentType);
      setUploads((prev: UploadsState) => ({
        ...prev,
        [documentType]: { ...INITIAL_UPLOAD_STATE },
      }));
    },
    [],
  );

  return {
    myStatus,
    publicStatus,
    loading,
    error,
    uploads,
    linkedInUrl,
    setLinkedInUrl,
    selectedDocumentType,
    setSelectedDocumentType,
    selectFile,
    uploadFile,
    submit,
    resubmit,
    refreshStatus: fetchStatus,
  };
}
