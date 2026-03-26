import React from 'react';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipNavigationProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#main-nav', label: 'Skip to navigation' },
];

/**
 * Renders visually-hidden skip links that become visible on focus,
 * allowing keyboard users to bypass repetitive navigation.
 */
const SkipNavigation: React.FC<SkipNavigationProps> = ({ links = defaultLinks }) => (
  <div className="skip-nav">
    {links.map(({ href, label }) => (
      <a
        key={href}
        href={href}
        className={[
          'absolute left-4 top-4 z-9999 px-4 py-2 rounded-lg',
          'bg-stellar text-white font-semibold text-sm',
          'translate-y-[-200%] focus:translate-y-0',
          'transition-transform duration-150',
          'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stellar',
        ].join(' ')}
      >
        {label}
      </a>
    ))}
  </div>
);

export default SkipNavigation;
