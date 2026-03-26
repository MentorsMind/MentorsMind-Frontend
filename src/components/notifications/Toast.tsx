import React from 'react';
import { X, Check, AlertTriangle, Info, MessageCircle, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { Notification } from '../../contexts/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  onAction?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  notification,
  onClose,
  onAction,
  autoClose = true,
  duration = 4000,
}) => {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    
    switch (notification.type) {
      case 'session_booking':
        return <Calendar className={`${iconClass} text-blue-600`} />;
      case 'payment_confirmed':
        return <DollarSign className={`${iconClass} text-green-600`} />;
      case 'session_cancelled':
        return <X className={`${iconClass} text-red-600`} />;
      case 'session_rescheduled':
        return <RefreshCw className={`${iconClass} text-yellow-600`} />;
      case 'message':
        return <MessageCircle className={`${iconClass} text-purple-600`} />;
      case 'system':
        return <Info className={`${iconClass} text-gray-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const getPriorityStyles = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-4 border-green-500 bg-green-50';
      default:
        return 'border-l-4 border-gray-300 bg-white';
    }
  };

  const getProgressBarColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div
      className={`
        relative max-w-md w-full rounded-lg shadow-lg border border-gray-200
        transform transition-all duration-300 ease-in-out
        hover:shadow-xl
        ${getPriorityStyles()}
      `}
    >
      {autoClose && (
        <div className="absolute top-0 left-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all ease-linear`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {getIcon()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                {notification.title}
              </h4>
              <button
                onClick={onClose}
                className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatTimestamp(notification.timestamp)}
              </span>
              
              {notification.actionUrl && (
                <button
                  onClick={() => {
                    if (onAction) {
                      onAction();
                    }
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {notification.actionLabel || 'View'} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    notification: Notification;
    onClose: (id: string) => void;
    onAction?: (id: string) => void;
  }>;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div
      className={`
        fixed z-50 space-y-2 pointer-events-none
        ${getPositionStyles()}
      `}
    >
      {toasts.map(({ id, notification, onClose, onAction }) => (
        <div key={id} className="pointer-events-auto">
          <Toast
            notification={notification}
            onClose={() => onClose(id)}
            onAction={() => onAction?.(id)}
          />
        </div>
      ))}
    </div>
  );
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
};

export default Toast;
