/**
 * DocumentCard component
 * Displays verification status for a single document with timeline
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import type { VerificationDocument, DocumentType } from '../../types/verification.types';
import { DOCUMENT_TYPES, STATUS_COLORS, STATUS_MESSAGES } from '../../types/verification.types';

interface DocumentCardProps {
  document: VerificationDocument;
  onResubmit?: (documentType: DocumentType) => void;
  isResubmitting?: boolean;
}

export default function DocumentCard({
  document,
  onResubmit,
  isResubmitting = false,
}: DocumentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = DOCUMENT_TYPES[document.type];
  const colorScheme = STATUS_COLORS[document.status];

  // Status icon component
  const StatusIcon = () => {
    switch (document.status) {
      case 'approved':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
        );
      case 'rejected':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        );
      case 'under_review':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-6 w-6 text-amber-600 animate-pulse" />
          </div>
        );
      case 'submitted':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
        );
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`rounded-lg border transition-all ${colorScheme.bg}`}>
      {/* Main Card Header */}
      <div className="p-4 flex items-start gap-4">
        <StatusIcon />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 text-left hover:opacity-75 transition-opacity"
              aria-expanded={isExpanded ? 'true' : 'false'}
              aria-label={isExpanded ? 'Collapse document details' : 'Expand document details'}
            >
              <h3 className="text-sm font-semibold text-gray-900">{config.label}</h3>
              <p className="text-xs text-gray-600 mt-1">{config.description}</p>
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colorScheme.badge}`}>
                {STATUS_MESSAGES[document.status]}
              </span>
              {document.status === 'rejected' && onResubmit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResubmit(document.type);
                  }}
                  disabled={isResubmitting}
                  className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Resubmit document"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {isResubmitting ? 'Resubmitting...' : 'Resubmit'}
                </button>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-200 rounded"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className={`border-t px-4 py-4 space-y-4 bg-opacity-50 ${colorScheme.bg}`}>
          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Timeline</h4>

            {/* Not Started */}
            {document.status === 'not_started' && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                  <div className="mt-2 h-8 w-0.5 bg-gray-200" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Not Started</p>
                  <p className="text-xs text-gray-500">Upload your document to begin verification</p>
                </div>
              </div>
            )}

            {/* Submitted */}
            {(['submitted', 'under_review', 'approved', 'rejected'] as const).includes(document.status) && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-400" />
                  <div className="mt-2 h-8 w-0.5 bg-gray-200" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Submitted</p>
                  <p className="text-xs text-gray-500">
                    {document.submittedAt ? formatDate(document.submittedAt) : 'Pending'}
                  </p>
                </div>
              </div>
            )}

            {/* Under Review */}
            {(['under_review', 'approved', 'rejected'] as const).includes(document.status) && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${document.status === 'under_review' ? 'bg-amber-400' : 'bg-green-400'}`} />
                  <div className="mt-2 h-8 w-0.5 bg-gray-200" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Under Review</p>
                  <p className="text-xs text-gray-500">Our team is reviewing your submission</p>
                </div>
              </div>
            )}

            {/* Approved */}
            {document.status === 'approved' && document.approvedAt && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Approved ✓</p>
                  <p className="text-xs text-gray-500">{formatDate(document.approvedAt)}</p>
                </div>
              </div>
            )}

            {/* Rejected */}
            {document.status === 'rejected' && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Rejected</p>
                  <p className="text-xs text-gray-500">
                    {document.rejectionReason || 'Rejected by our verification team'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Information */}
          {document.fileName && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">File Information</h4>
              <div className="rounded-lg bg-white bg-opacity-50 p-3 space-y-1">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">File:</span> {document.fileName}
                </p>
                {document.fileSize && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Size:</span> {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {document.status === 'rejected' && document.rejectionReason && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Feedback</h4>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs text-red-800">{document.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Approval Information */}
          {document.status === 'approved' && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-green-800">
                ✓ This document has been verified and approved. Your verification status will be updated accordingly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
