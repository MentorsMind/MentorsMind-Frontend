import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs } = useNavigation();

  if (breadcrumbs.length <= 0) return null;

  return (
    <nav className="flex items-center px-4 py-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-x-auto whitespace-nowrap bg-transparent">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={14} className="mx-2 text-gray-400 shrink-0" />
            )}
            
            <Link
              to={breadcrumb.path}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                breadcrumb.isLast
                  ? 'text-gray-900 pointer-events-none'
                  : 'text-gray-500 hover:text-stellar'
              }`}
            >
              {index === 0 ? (
                <Home size={14} className={breadcrumb.isLast ? 'text-gray-900' : 'text-gray-500'} />
              ) : null}
              {breadcrumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};
