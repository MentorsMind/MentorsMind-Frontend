import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const STYLES: Record<ToastType, string> = {
  success: 'bg-green-600',
  error:   'bg-red-600',
  info:    'bg-indigo-600',
  warning: 'bg-yellow-500',
};

const ICONS: Record<ToastType, string> = {
  success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️',
};

export default function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg text-sm max-w-sm ${STYLES[type]}`}>
      <span>{ICONS[type]}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}
