import type { IconType } from 'react-icons';
import {
  LuBlocks,
  LuBuilding2,
  LuCircleDot,
  LuCreditCard,
  LuGauge,
  LuLayoutGrid,
  LuReceipt,
  LuScrollText,
  LuSettings,
  LuShieldCheck,
  LuUser,
  LuUsers,
} from 'react-icons/lu';

/**
 * Maps the backend navigation `icon` strings to react-icons. Unknown keys fall back to a neutral
 * dot, so a new backend menu entry never breaks the sidebar. Add an entry here when a module
 * registers a new icon key on the backend.
 */
const REGISTRY: Record<string, IconType> = {
  users: LuUsers,
  user: LuUser,
  shield: LuShieldCheck,
  roles: LuShieldCheck,
  scroll: LuScrollText,
  audit: LuScrollText,
  dashboard: LuGauge,
  gauge: LuGauge,
  building: LuBuilding2,
  companies: LuBuilding2,
  apps: LuLayoutGrid,
  plans: LuReceipt,
  billing: LuCreditCard,
  settings: LuSettings,
  modules: LuBlocks,
};

export const FALLBACK_ICON: IconType = LuCircleDot;

export function iconFor(key: string | undefined): IconType {
  return (key && REGISTRY[key]) || FALLBACK_ICON;
}
