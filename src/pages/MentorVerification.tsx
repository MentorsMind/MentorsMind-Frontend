/**
 * MentorVerification page
 * Complete mentor verification UI with document checklist, upload, and status tracking
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Award, Upload, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import FileUpload from '../components/mentor/FileUpload';
import DocumentCard from '../components/mentor/DocumentCard';
import {
  getMentorVerificationStatus,
  uploadVerificationDocument,
  formatFileSize,
} from '../services/verification.service';
import type {
  MentorVerificationData,
  DocumentType,
  VerificationDocument,
  DocumentUploadProgress,
} from '../types/verification.types';
import { DOCUMENT_TYPES } from '../types/verification.types';

export default function MentorVerification() {
  const { id: mentorId } = useParams<{ id: string }>();
  const [verificationData, setVerificationData] = useState<MentorVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<DocumentType, File | null>>({
    government_id: null,
    professional_credentials: null,
    linkedin_profile: null,
  });
  const [uploadingDocument, setUploadingDocument] = useState<DocumentType | null>(null);
  const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress | null>(null);

  const currentMentorId = mentorId || 'm1';

  // Fetch verification status on mount
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMentorVerificationStatus(currentMentorId);
        setVerificationData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load verification status');
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [currentMentorId]);

  // Handle file selection
  const handleFileSelect = (documentType: DocumentType) => (file: File | null) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [documentType]: file,
    }));
  };

  // Handle LinkedIn URL change
  const handleLinkedInUrlChange = (url: string) => {
    if (url) {
      // Create a synthetic File-like object for LinkedIn
      const linkedInFile = new File([url], 'linkedin-profile-url', {
        type: 'text/plain',
      });
      setSelectedFiles((prev) => ({
        ...prev,
        linkedin_profile: linkedInFile,
      }));
    } else {
      setSelectedFiles((prev) => ({
        ...prev,
        linkedin_profile: null,
      }));
    }
  };

  // Handle document upload
  const handleUploadDocument = async (documentType: DocumentType) => {
    const file = selectedFiles[documentType];
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploadingDocument(documentType);
      setError(null);

      const response = await uploadVerificationDocument(
        currentMentorId,
        {
          file,
          documentType,
          metadata:
            documentType === 'linkedin_profile'
              ? { linkedinUrl: file.name } // Using file.name as URL placeholder
              : undefined,
        },
        (progressEvent) => {
          const progress: DocumentUploadProgress = {
            fileName: file.name,
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
          };
          setUploadProgress(progress);
        }
      );

      // Refresh verification data
      const updatedData = await getMentorVerificationStatus(currentMentorId);
      setVerificationData(updatedData);

      // Clear selected file
      setSelectedFiles((prev) => ({
        ...prev,
        [documentType]: null,
      }));

      toast.success(`${DOCUMENT_TYPES[documentType].label} submitted successfully!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploadingDocument(null);
      setUploadProgress(null);
    }
  };

  // Handle document resubmission
  const handleResubmitDocument = async (documentType: DocumentType) => {
    await handleUploadDocument(documentType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-600">Loading your verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!verificationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Verification</h3>
                <p className="mt-1 text-sm text-red-800">{error || 'Could not load verification data'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allDocumentsApproved = verificationData.allDocumentsApproved;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Verification</h1>
          <p className="text-gray-600">
            Complete your verification to unlock your "Verified Mentor" badge and build trust with learners.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Status</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">
                  {verificationData.overallStatus.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="text-right">
                {verificationData.overallStatus === 'approved' ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : verificationData.overallStatus === 'rejected' ? (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                ) : (
                  <Upload className="h-8 w-8 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6">
            <div>
              <p className="text-sm text-gray-600">Documents Uploaded</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {verificationData.documents.filter((d) => d.status !== 'not_started').length}/
                {verificationData.documents.length}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6">
            <div>
              <p className="text-sm text-gray-600">Approved Documents</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {verificationData.documents.filter((d) => d.status === 'approved').length}/
                {verificationData.documents.length}
              </p>
            </div>
          </div>
        </div>

        {/* Verified Mentor Badge Preview */}
        {allDocumentsApproved && (
          <div className="mb-8 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 p-3 flex-shrink-0">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Verified Mentor Badge</h3>
                <p className="mt-1 text-sm text-amber-700">
                  🎉 Congratulations! All documents are approved. Your "Verified Mentor" badge is active on your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Document Upload Section */}
        <div className="space-y-6">
          {verificationData.documents.map((document) => (
            <div key={document.id} className="rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
              {/* Document Card */}
              <DocumentCard
                document={document}
                onResubmit={handleResubmitDocument}
                isResubmitting={uploadingDocument === document.type}
              />

              {/* Upload Form - Show if not approved */}
              {document.status !== 'approved' && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="space-y-4">
                    {/* File Upload Component */}
                    <FileUpload
                      documentType={document.type}
                      onFileSelect={handleFileSelect(document.type)}
                      onLinkedInUrlChange={handleLinkedInUrlChange}
                      disabled={uploadingDocument !== null}
                      isLoading={uploadingDocument === document.type}
                    />

                    {/* Upload Progress */}
                    {uploadingDocument === document.type && uploadProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-700">Uploading...</span>
                          <span className="text-gray-600">
                            {uploadProgress.percentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 progress-bar"
                            role="progressbar"
                            aria-valuenow={Math.round(uploadProgress.percentage)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Upload progress"
                          />
                        </div>
                        <p className="text-xs text-gray-600">
                          {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                        </p>
                      </div>
                    )}

                    {/* Upload Button */}
                    {selectedFiles[document.type] && (
                      <button
                        onClick={() => handleUploadDocument(document.type)}
                        disabled={uploadingDocument !== null}
                        className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {uploadingDocument === document.type ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Submit {DOCUMENT_TYPES[document.type].label}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Verification Timeline */}
        <div className="mt-8 rounded-lg bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Timeline</h3>
          <div className="space-y-3">
            {verificationData.timeline.map((entry, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 flex-shrink-0" />
                  {index < verificationData.timeline.length - 1 && (
                    <div className="mt-2 h-8 w-0.5 bg-gray-200" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {entry.stage.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-600">{entry.message}</p>
                  {entry.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Government ID must be valid and clearly readable</li>
            <li>✓ Professional credentials should show your name and qualification details</li>
            <li>✓ LinkedIn profile must be publicly accessible</li>
            <li>✓ All documents must be in PDF, JPG, or PNG format (max 5MB)</li>
            <li>✓ Verification usually takes 1-3 business days</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
