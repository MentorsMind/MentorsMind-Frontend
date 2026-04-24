import { useState } from 'react';

// Deterministic color palette — same user always gets the same color
const COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-rose-500',
  'bg-orange-500', 'bg-amber-500', 'bg-teal-500', 'bg-cyan-500',
];

function getInitialsColor(firstName?: string, lastName?: string): string {
  const seed = `${firstName ?? ''}${lastName ?? ''}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(firstName?: string, lastName?: string, name?: string): string {
  if (firstName || lastName) {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0][0] ?? '?').toUpperCase();
  }
  return '?';
}

interface UserAvatarProps {
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  /** Fallback when firstName/lastName are absent */
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const SIZE_CLASSES = {
  sm:  'w-9 h-9 text-sm',
  md:  'w-11 h-11 text-base',
  lg:  'w-14 h-14 text-lg',
  xl:  'w-24 h-24 text-2xl',
};

export default function UserAvatar({
  avatarUrl,
  firstName,
  lastName,
  name,
  size = 'sm',
  className = '',
  alt,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClass = SIZE_CLASSES[size];
  const initials = getInitials(firstName, lastName, name);
  const colorClass = getInitialsColor(firstName, lastName);
  const baseClass = `rounded-full shrink-0 ${sizeClass} ${className}`;

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={alt ?? name ?? `${firstName ?? ''} ${lastName ?? ''}`.trim()}
        className={`${baseClass} object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${baseClass} ${colorClass} flex items-center justify-center font-bold text-white`}>
      {initials}
    </div>
  );
}
