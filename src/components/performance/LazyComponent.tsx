import { Suspense, lazy } from 'react';
import type { ComponentType } from 'react';
import { Spinner } from '../ui/Loading';

export function lazyLoad<T extends ComponentType<Record<string, unknown>>>(factory: () => Promise<{ default: T }>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = lazy(factory) as any;
  return function LazyWrapper(props: Record<string, unknown>) {
    return (
      <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export default function LazyComponent({ fallback, children }: { fallback?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Suspense fallback={fallback ?? <div className="flex justify-center py-12"><Spinner /></div>}>
      {children}
    </Suspense>
  );
}
