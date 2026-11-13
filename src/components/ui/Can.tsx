import type { ReactNode } from 'react';
import { useAuth } from '@/context/authState';

/** Renders children only with the permission: `<Can permission="blood_donars:create">`. */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useAuth().can(permission) ? children : fallback;
}
