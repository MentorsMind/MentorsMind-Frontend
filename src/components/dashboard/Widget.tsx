import React from 'react';
import { WidgetConfig } from '../../types/dashboard.types';

interface WidgetProps {
  config: WidgetConfig;
  children: React.ReactNode;
  onRemove?: () => void;
}

export const Widget: React.FC<WidgetProps> = ({ config, children, onRemove }) => {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-3',
  };

  if (!config.visible) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${sizeClasses[config.size]}`}>
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wider">
          {config.title}
        </h3>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label={`Remove ${config.title}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
