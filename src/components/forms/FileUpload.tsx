import React, { useState, useRef, DragEvent } from 'react';
import { FileUploadConfig } from '../../types/forms.types';
import { formatFileSize } from '../../utils/validation.utils';

type FileUploadProps = {
  onChange?: (files: File[]) => void;
  config?: FileUploadConfig;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  config = {},
  multiple = false,
  disabled = false,
  className = '',
  id,
  name
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { maxSize = 5 * 1024 * 1024, maxFiles = 5, acceptedTypes = [] } = config;

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`;
    }
    if (acceptedTypes.length > 0 && !acceptedTypes.some(type => file.type.match(type))) {
      return `${file.name} is not an accepted file type`;
    }
    return null;
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    if (!multiple && fileArray.length > 1) {
      validationErrors.push('Only one file is allowed');
      setErrors(validationErrors);
      return;
    }

    if (files.length + fileArray.length > maxFiles) {
      validationErrors.push(`Maximum ${maxFiles} files allowed`);
      setErrors(validationErrors);
      return;
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(validationErrors);
    
    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          id={id}
          name={name}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
          aria-label="File upload"
        />
        
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop files here, or click to select
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {acceptedTypes.length > 0 && `Accepted: ${acceptedTypes.join(', ')} • `}
          Max size: {formatFileSize(maxSize)}
        </p>
      </div>

      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-red-600 hover:text-red-800"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
