import React from 'react';
import { AlertTriangle, WifiOff, RefreshCw, Home } from 'lucide-react';
import { ErrorType } from '../utils/error.utils';

interface ErrorPageProps {
  error: Error;
  errorId: string;
  errorType: ErrorType;
  resetError: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, errorId, errorType, resetError }) => {
  const goHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    // Hard reload is required for chunk errors to fetch new JS bundles
    if (errorType === 'CHUNK_LOAD_ERROR') {
      window.location.reload();
    } else {
      resetError();
    }
  };

  const contentMap = {
    CHUNK_LOAD_ERROR: {
      icon: <RefreshCw className="w-12 h-12 text-stellar" />,
      title: 'Update Available',
      description: 'A new version of MentorMinds is available. Please refresh to load the latest updates.',
      primaryAction: 'Refresh Page',
    },
    NETWORK_ERROR: {
      icon: <WifiOff className="w-12 h-12 text-stellar" />,
      title: 'Connection Lost',
      description: 'We are having trouble connecting to the network. Please check your connection and try again.',
      primaryAction: 'Try Again',
    },
    APP_ERROR: {
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      title: 'Something went wrong',
      description: 'We encountered an unexpected error. Our engineering team has been notified.',
      primaryAction: 'Try Again',
    },
  };

  const content = contentMap[errorType];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="mb-6 p-5 bg-gray-50 rounded-full border border-gray-100 shadow-sm">
        {content.icon}
      </div>
      
      <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
        {content.title}
      </h1>
      
      <p className="text-gray-500 font-medium max-w-md mb-8 leading-relaxed">
        {content.description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
        <button
          onClick={handleRefresh}
          className="w-full sm:w-auto px-8 py-3 bg-stellar text-white font-bold rounded-2xl hover:bg-stellar/90 shadow-xl shadow-stellar/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {content.primaryAction}
        </button>
        
        <button
          onClick={goHome}
          className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
      </div>

      <div className="text-xs text-gray-400 font-mono bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
        Error ID: {errorId} <br />
        <span className="hidden sm:inline">{error.message}</span>
      </div>
    </div>
  );
};

export default ErrorPage;