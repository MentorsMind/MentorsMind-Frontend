import React, { useState, useEffect } from 'react';

interface NetworkErrorToastProps {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}

const NetworkErrorToast: React.FC<NetworkErrorToastProps> = ({ message, onRetry, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Don't auto-close if it's a critical network error? 
      // Actually, user said "Add network error toast with retry button", usually these stay until action or manual close.
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[100] w-80 bg-white border-l-4 border-red-500 shadow-2xl rounded-r-lg p-4 animate-in slide-in-from-right duration-300">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">Network Error</p>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => {
                onRetry();
                onClose();
              }}
              className="text-sm font-bold text-stellar hover:text-stellar-dark"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="text-sm font-medium text-gray-400 hover:text-gray-600"
            >
              Dismiss
            </button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorToast;
