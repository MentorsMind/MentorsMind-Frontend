import React from 'react';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  /** Render as a different element (default: span) */
  as?: keyof JSX.IntrinsicElements;
  /** Make focusable — useful for skip links or announcements */
  focusable?: boolean;
}

/**
 * Visually hides content while keeping it accessible to screen readers.
 * Uses the industry-standard `.sr-only` technique.
 */
const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  as: Tag = 'span',
  focusable = false,
}) => (
  <Tag
    className={focusable ? 'sr-only focus:not-sr-only focus:absolute focus:z-50' : 'sr-only'}
  >
    {children}
  </Tag>
);

export default ScreenReaderOnly;
