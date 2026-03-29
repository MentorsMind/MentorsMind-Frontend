import React, { Suspense } from 'react'

type Loader<T extends React.ComponentType<any>> = () => Promise<{ default: T }>

export function lazyWithPreload<T extends React.ComponentType<any>>(loader: Loader<T>) {
  const LazyComponent = React.lazy(loader)
  ;(LazyComponent as any).preload = loader
  return LazyComponent as React.LazyExoticComponent<T> & { preload?: () => Promise<any> }
}

export const LazyBoundary: React.FC<{ fallback?: React.ReactNode; children: React.ReactNode }> = ({ fallback = null, children }) => {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

export default LazyBoundary
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
