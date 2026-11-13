import { createContext, useContext } from 'react';
import type { Site } from '@/api/schemas';

export type SiteStatus = 'loading' | 'ready' | 'not-found' | 'error';

export interface SiteState {
  status: SiteStatus;
  site: Site | null;
  error: unknown;
  retry: () => void;
}

export const SiteContext = createContext<SiteState | null>(null);

export function useSite(): SiteState {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
}

/** For screens rendered behind the site gate, where the site always exists. */
export function useReadySite(): Site {
  const { site } = useSite();
  if (!site) throw new Error('useReadySite must be used behind SiteGate');
  return site;
}
