import React, { useState, useRef, useCallback, KeyboardEvent, ChangeEvent, DragEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface PreviewFile {
  file: File;
  previewUrl?: string; // only for images
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addFiles = useCallback((incoming: File[]) => {
    const previews: PreviewFile[] = incoming.map((f) => ({
      file: f,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));
    setFiles((prev) => [...prev, ...previews]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed && files.length === 0) return;
    onSendMessage(trimmed, files.length > 0 ? files.map((f) => f.file) : undefined);
    setMessage('');
    // Revoke object URLs
    files.forEach((f) => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
    setFiles([]);
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [message, files, onSendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  // ── Drag-and-drop ──────────────────────────────────────────────────────────

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Only clear if leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) addFiles(dropped);
  };

  const canSend = !disabled && (message.trim().length > 0 || files.length > 0);

  return (
    <div
      className={`border-t border-gray-100 bg-white transition-colors ${
        isDragging ? 'bg-blue-50 border-blue-300' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay hint */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-2xl px-8 py-4">
            <p className="text-blue-600 font-medium text-sm">Drop files to attach</p>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* File previews */}
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((pf, index) => (
              <div key={index} className="relative group">
                {pf.previewUrl ? (
                  // Image thumbnail
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={pf.previewUrl}
                      alt={pf.file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  // Non-image file chip
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 max-w-[180px]">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{pf.file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(pf.file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                      aria-label="Remove"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Attach file"
            title="Attach file (or drag & drop)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isDragging ? 'Drop files here…' : 'Type a message…'}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-stellar/20 focus:border-stellar transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex-shrink-0 p-2.5 bg-stellar text-white rounded-xl hover:bg-stellar-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Drag hint */}
        <p className="text-xs text-gray-400 mt-1.5 text-center select-none">
          Press Enter to send · Shift+Enter for new line · Drag &amp; drop files
        </p>
      </div>
    </div>
  );
};

export default MessageInput;
