import { ReactNode } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const styles: Record<AlertType, { wrapper: string; icon: string }> = {
  success: { wrapper: 'bg-green-50 border-green-200 text-green-800', icon: '✅' },
  error:   { wrapper: 'bg-red-50 border-red-200 text-red-800',       icon: '❌' },
  warning: { wrapper: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: '⚠️' },
  info:    { wrapper: 'bg-blue-50 border-blue-200 text-blue-800',    icon: 'ℹ️' },
};

export default function Alert({ type = 'info', title, children, onClose }: AlertProps) {
  const s = styles[type];
  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${s.wrapper}`} role="alert">
      <span className="text-lg leading-none">{s.icon}</span>
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 text-lg leading-none" aria-label="Dismiss">×</button>
      )}
    </div>
  );
}
