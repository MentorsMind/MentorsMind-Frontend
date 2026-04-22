import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  // Optional flag to make the container smaller if it's inside a tight card/tab
  variant?: 'page' | 'card'; 
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'page'
}) => {
  const containerPadding = variant === 'page' ? 'py-20 px-4' : 'py-10 px-4';

  return (
    <div className={`flex flex-col items-center justify-center text-center w-full ${containerPadding} animate-in fade-in duration-700`}>
      <div className="mb-6 p-4 bg-gray-50 rounded-full text-gray-400 border border-gray-100 shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-500 font-medium max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-8 py-3 bg-stellar text-white font-bold rounded-2xl hover:bg-stellar-dark shadow-xl shadow-stellar/30 transition-all hover:-translate-y-1 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};