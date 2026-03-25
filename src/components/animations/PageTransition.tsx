import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useAnimation';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Key that changes to trigger the transition */
  transitionKey: string | number;
  variant?: 'fade' | 'slide-up' | 'slide-left' | 'scale';
  className?: string;
}

type TransitionVariant = 'fade' | 'slide-up' | 'slide-left' | 'scale';

const VARIANTS: Record<TransitionVariant, string> = {
  'fade':       'animate-in fade-in duration-300',
  'slide-up':   'animate-in fade-in slide-in-from-bottom-4 duration-400',
  'slide-left': 'animate-in fade-in slide-in-from-right-4 duration-400',
  'scale':      'animate-in fade-in zoom-in-95 duration-300',
};

/**
 * Wraps page-level content and plays an entrance animation
 * whenever `transitionKey` changes.
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionKey,
  variant = 'fade',
  className = '',
}) => {
  const reduced = useReducedMotion();
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (reduced) return;
    setAnimClass(VARIANTS[variant]);
    const t = setTimeout(() => setAnimClass(''), 500);
    return () => clearTimeout(t);
  }, [transitionKey, variant, reduced]);

  return (
    <div className={`${animClass} ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;
