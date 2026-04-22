import { useRef, useState } from 'react';
import LiveRegion from '../a11y/LiveRegion';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onFile: (file: File) => void;
  error?: string;
}

export default function FileUpload({ label, accept, maxSizeMB = 5, onFile, error }: FileUploadProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [localError, setLocalError] = useState('');

  const handle = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File must be under ${maxSizeMB}MB`);
      return;
    }
    setLocalError('');
    setFileName(file.name);
    onFile(file);
  };

  const displayError = error || localError;

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
        role="button"
        tabIndex={0}
        aria-label={label ? `${label} file upload` : 'File upload'}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ref.current?.click(); } }}
      >
        <p className="text-sm text-gray-500">{fileName || 'Drop file here or click to browse'}</p>
        <p className="text-xs text-gray-400 mt-1">Max {maxSizeMB}MB</p>
      </div>
      {/* Live region announces drag state and selected file for screen readers */}
      <LiveRegion message={dragOver ? 'File drag detected. Drop to upload.' : fileName ? `Selected file ${fileName}` : ''} politeness={dragOver ? 'assertive' : 'polite'} clearAfter={4000} />
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      {displayError && <p className="text-xs text-red-600">{displayError}</p>}
    </div>
  );
}
