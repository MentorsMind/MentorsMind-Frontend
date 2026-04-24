/**
 * FileUpload component with drag-and-drop support
 * Handles file selection, validation, and upload progress
 */

import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { DocumentType } from '../../types/verification.types';
import { DOCUMENT_TYPES, validateFile, validateLinkedInUrl } from '../../services/verification.service';

interface FileUploadProps {
  documentType: DocumentType;
  onFileSelect: (file: File | null) => void;
  onLinkedInUrlChange?: (url: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

interface ValidationState {
  isValid: boolean;
  error?: string;
}

export default function FileUpload({
  documentType,
  onFileSelect,
  onLinkedInUrlChange,
  disabled = false,
  isLoading = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [validation, setValidation] = useState<ValidationState>({ isValid: true });
  const [isDragging, setIsDragging] = useState(false);

  const config = DOCUMENT_TYPES[documentType];
  const isLinkedIn = documentType === 'linkedin_profile';

  // Handle file selection from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Validate and set file
  const validateAndSetFile = (file: File) => {
    const validation = validateFile(
      file,
      config.requiredFormats as string[],
      config.maxSize
    );

    if (validation.valid) {
      setSelectedFile(file);
      setValidation({ isValid: true });
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      setValidation({ isValid: false, error: validation.error });
      onFileSelect(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isLoading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  // Handle LinkedIn URL change
  const handleLinkedInUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLinkedInUrl(url);

    if (url) {
      const validation = validateLinkedInUrl(url);
      if (validation.valid) {
        setValidation({ isValid: true });
        onLinkedInUrlChange?.(url);
      } else {
        setValidation({ isValid: false, error: validation.error });
      }
    } else {
      setValidation({ isValid: true });
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null);
    setValidation({ isValid: true });
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear LinkedIn URL
  const handleClearLinkedInUrl = () => {
    setLinkedInUrl('');
    setValidation({ isValid: true });
    onLinkedInUrlChange?.('');
  };

  if (isLinkedIn) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {config.label}
          <span className="ml-1 text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedInUrl}
            onChange={handleLinkedInUrlChange}
            disabled={disabled || isLoading}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              validation.isValid
                ? 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/10'
                : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
            } ${
              disabled || isLoading
                ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-900'
            } focus:outline-none`}
          />
          {linkedInUrl && !isLoading && (
            <button
              type="button"
              onClick={handleClearLinkedInUrl}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear LinkedIn URL"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600">{config.description}</p>
        {!validation.isValid && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
            <p className="text-sm text-red-800">{validation.error}</p>
          </div>
        )}
        {linkedInUrl && validation.isValid && (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
            <p className="text-sm text-green-800">LinkedIn URL is valid</p>
          </div>
        )}
      </div>
    );
  }

  // File upload UI
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {config.label}
        <span className="ml-1 text-red-500">*</span>
      </label>

      {selectedFile ? (
        // File selected state
        <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isLoading && (
              <button
                type="button"
                onClick={handleClearFile}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
                aria-label="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        // Drag and drop area
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : validation.isValid
                ? 'border-gray-300 bg-gray-50'
                : 'border-red-300 bg-red-50'
          } ${
            disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          } p-8`}
          onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading) {
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept={config.requiredFormats.map((f) => `.${f.toLowerCase()}`).join(',')}
            disabled={disabled || isLoading}
            className="hidden"
            aria-label="File upload"
          />

          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className={`rounded-full p-3 ${isDragging ? 'bg-primary/10' : 'bg-gray-100'}`}>
              <Upload
                className={`h-6 w-6 ${
                  isDragging ? 'text-primary' : 'text-gray-400'
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isLoading ? 'Uploading...' : 'Drag and drop your file here'}
              </p>
              <p className="text-xs text-gray-600">
                or click to select from your computer
              </p>
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <p>Accepted formats: {config.requiredFormats.join(', ')}</p>
              <p>Maximum file size: {(config.maxSize / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>
        </div>
      )}

      {!validation.isValid && !selectedFile && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
          <p className="text-sm text-red-800">{validation.error}</p>
        </div>
      )}

      <p className="text-xs text-gray-600">{config.description}</p>
    </div>
  );
}
