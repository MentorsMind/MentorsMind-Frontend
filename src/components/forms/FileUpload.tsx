import React, { useState, useRef, DragEvent } from 'react';
import { FileUploadConfig } from '../../types/forms.types';
import { formatFileSize } from '../../utils/validation.utils';

type FileUploadProps = {
  onChange?: (files: File[]) => void;
  onFileSelect?: (files: File[]) => void;
  config?: FileUploadConfig;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  accept?: string;
  maxSize?: number;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  onFileSelect,
  config = {},
  multiple = false,
  disabled = false,
  className = '',
  id,
  name,
  accept,
  maxSize: directMaxSize
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveOnChange = onFileSelect || onChange;

  const { maxSize = directMaxSize || 5 * 1024 * 1024, maxFiles = 5, acceptedTypes = accept ? [accept] : [] } = config;

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
      effectiveOnChange?.(updatedFiles);
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
    effectiveOnChange?.(updatedFiles);
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
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:shadow-inner ${
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-[0.98]'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
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
        
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500 transition-transform group-hover:scale-110">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <p className="text-sm font-bold text-gray-900 mb-1">
          {isDragging ? 'Drop it here!' : 'Click or drag photo here'}
        </p>
        <p className="text-xs text-gray-400">
          JPG, PNG or WEBP (Max {formatFileSize(maxSize)})
        </p>
      </div>

      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 font-medium" role="alert">
              {error}
            </p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in slide-in-from-top-1 duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                   {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                   ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                   )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{file.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
