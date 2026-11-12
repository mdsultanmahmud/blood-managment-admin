import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';

/**
 * Every react-icons set, loaded on demand: each set is its own lazy chunk (some are several MB),
 * so nothing here reaches the main bundle. Lucide is imported with `?all` because the app also
 * imports it icon by icon (see `src/react-icons-all.d.ts`). An icon is stored as `set:Name`
 * (`lu:LuUsers`), because some sets share a name prefix (`fa` and `fa6` both export `Fa*`).
 * Mirror the backend's `ICON_KEY_PATTERN` in `backend/src/modules/apps/menu.schemas.ts`.
 */
type IconModule = Record<string, unknown>;

export interface IconSet {
  id: string;
  label: string;
  load: () => Promise<IconModule>;
}

export const ICON_SETS: readonly IconSet[] = [
  { id: 'lu', label: 'Lucide', load: () => import('react-icons/lu?all') },
  { id: 'ai', label: 'Ant Design', load: () => import('react-icons/ai') },
  { id: 'bs', label: 'Bootstrap', load: () => import('react-icons/bs') },
  { id: 'bi', label: 'BoxIcons', load: () => import('react-icons/bi') },
  { id: 'ci', label: 'Circum', load: () => import('react-icons/ci') },
  { id: 'cg', label: 'css.gg', load: () => import('react-icons/cg') },
  { id: 'di', label: 'Devicons', load: () => import('react-icons/di') },
  { id: 'fi', label: 'Feather', load: () => import('react-icons/fi') },
  { id: 'fc', label: 'Flat Color', load: () => import('react-icons/fc') },
  { id: 'fa', label: 'Font Awesome 5', load: () => import('react-icons/fa') },
  { id: 'fa6', label: 'Font Awesome 6', load: () => import('react-icons/fa6') },
  { id: 'gi', label: 'Game Icons', load: () => import('react-icons/gi') },
  { id: 'go', label: 'GitHub Octicons', load: () => import('react-icons/go') },
  { id: 'gr', label: 'Grommet', load: () => import('react-icons/gr') },
  { id: 'hi', label: 'Heroicons', load: () => import('react-icons/hi') },
  { id: 'hi2', label: 'Heroicons 2', load: () => import('react-icons/hi2') },
  { id: 'im', label: 'IcoMoon Free', load: () => import('react-icons/im') },
  { id: 'lia', label: 'Icons8 Line Awesome', load: () => import('react-icons/lia') },
  { id: 'io', label: 'Ionicons 4', load: () => import('react-icons/io') },
  { id: 'io5', label: 'Ionicons 5', load: () => import('react-icons/io5') },
  { id: 'md', label: 'Material Design', load: () => import('react-icons/md') },
  { id: 'pi', label: 'Phosphor', load: () => import('react-icons/pi') },
  { id: 'rx', label: 'Radix', load: () => import('react-icons/rx') },
  { id: 'ri', label: 'Remix', load: () => import('react-icons/ri') },
  { id: 'si', label: 'Simple Icons (brands)', load: () => import('react-icons/si') },
  { id: 'sl', label: 'Simple Line', load: () => import('react-icons/sl') },
  { id: 'tb', label: 'Tabler', load: () => import('react-icons/tb') },
  { id: 'tfi', label: 'Themify', load: () => import('react-icons/tfi') },
  { id: 'ti', label: 'Typicons', load: () => import('react-icons/ti') },
  { id: 'vsc', label: 'VS Code', load: () => import('react-icons/vsc') },
  { id: 'wi', label: 'Weather', load: () => import('react-icons/wi') },
];

export const DEFAULT_ICON_SET = 'lu';

const SETS_BY_ID = new Map(ICON_SETS.map((s) => [s.id, s]));
const REACT_ICON = /^(?<set>[a-z][a-z0-9]*):(?<name>[A-Z][A-Za-z0-9]*)$/;

/** `lu:LuUsers` to its set and component name; null for registry keys and garbage. */
export function parseReactIcon(
  value: string | null | undefined,
): { set: string; name: string } | null {
  const { set, name } = (value && REACT_ICON.exec(value)?.groups) || {};
  return set && name && SETS_BY_ID.has(set) ? { set, name } : null;
}

export function reactIconValue(set: string, name: string): string {
  return `${set}:${name}`;
}

/** A loaded set: its icons by component name, and the names in the module's (alphabetical) order. */
export interface LoadedIconSet {
  icons: ReadonlyMap<string, IconType>;
  names: readonly string[];
}

const loaded = new Map<string, LoadedIconSet>();
const pending = new Map<string, Promise<LoadedIconSet>>();

export function loadIconSet(id: string): Promise<LoadedIconSet> {
  const ready = loaded.get(id);
  if (ready) return Promise.resolve(ready);
  let p = pending.get(id);
  if (!p) {
    const set = SETS_BY_ID.get(id);
    if (!set) return Promise.reject(new Error(`Unknown icon set ${id}`));
    p = set.load().then((mod) => {
      const icons = new Map<string, IconType>();
      for (const [name, value] of Object.entries(mod)) {
        if (typeof value === 'function' && /^[A-Z]/.test(name)) icons.set(name, value as IconType);
      }
      const result = { icons, names: [...icons.keys()] };
      loaded.set(id, result);
      pending.delete(id);
      return result;
    });
    p.catch(() => pending.delete(id));
    pending.set(id, p);
  }
  return p;
}

/** The set once loaded (immediately when already cached), or null while loading or on failure. */
export function useIconSet(id: string | null): LoadedIconSet | null {
  const [, rerender] = useState(0);
  useEffect(() => {
    if (!id || loaded.has(id)) return;
    let live = true;
    loadIconSet(id).then(
      () => live && rerender((n) => n + 1),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [id]);
  return id ? (loaded.get(id) ?? null) : null;
}

/**
 * Icons whose name contains every word of the query, case-insensitively. Takes names or stored
 * `set:Name` values (the set is not searched): `user plus` finds `lu:LuUserPlus`.
 */
export function searchIcons(icons: readonly string[], query: string, limit: number): string[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const icon of icons) {
    const name = icon.slice(icon.indexOf(':') + 1).toLowerCase();
    if (words.every((w) => name.includes(w))) {
      out.push(icon);
      if (out.length >= limit) break;
    }
  }
  return out;
}
