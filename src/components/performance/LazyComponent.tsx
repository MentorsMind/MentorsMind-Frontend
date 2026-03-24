import React, { Suspense } from 'react';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-sm font-medium text-gray-500 shadow-sm">
      Loading optimized view...
    </div>
  ),
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

export default LazyComponent;
