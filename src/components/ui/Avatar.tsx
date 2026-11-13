import { useState } from 'react';
import { apiUrl } from '@/lib/env';
import { initialsOf } from '@/lib/initials';
import { cn } from '@/lib/cn';

/** Stable pick from a few theme shades so initials avatars are told apart without new colors. */
const FALLBACK_TONES = [
  'bg-primary-100 text-primary-800',
  'bg-neutral-200 text-neutral-800',
  'bg-info-100 text-info-800',
  'bg-success-100 text-success-800',
  'bg-warning-100 text-warning-800',
];

function toneFor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK_TONES[h % FALLBACK_TONES.length] ?? '';
}

/**
 * The one avatar used everywhere. `src` is the backend's versioned avatarUrl (cache-busting is
 * built into the URL), resolved against the API base. Falls back to initials on missing or
 * broken images.
 */
export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none',
        !showImage && toneFor(name),
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }}
      aria-hidden={!showImage}
    >
      {showImage && src ? (
        <img
          src={/^(blob|data):/.test(src) ? src : apiUrl(src)}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
          draggable={false}
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
