import type { RoleMenu } from '@/api/modules/roles';
import type { NavNode } from '@/api/schemas';
import { menuLeaves } from '@/lib/menus';
import { permissionKey, type AppAction } from '@/lib/permissions';
import { operationsOf } from '@/routes/pages';

/** Matrix columns, in order: Show in menu, View, Create, Update, Delete. */
export const FLAGS = ['visible', 'read', 'create', 'update', 'delete'] as const;
export type Flag = (typeof FLAGS)[number];
export type Flags = Record<Flag, boolean>;
export const EMPTY_FLAGS: Flags = Object.freeze({
  visible: false,
  read: false,
  create: false,
  update: false,
  delete: false,
});

/** Menu key -> flags; a menu without View is absent. */
export type Matrix = ReadonlyMap<string, Flags>;

/** Cells offered for a menu: Show in menu and View always, then the page's declared writes. */
export function flagsFor(menuKey: string): readonly Flag[] {
  const ops = new Set<AppAction>(operationsOf(menuKey));
  return FLAGS.filter((f) => f === 'visible' || f === 'read' || ops.has(f));
}

/** One cell. Any other flag turns View on; View off clears the row (ADR 0023 flag rules). */
export function setFlag(m: Matrix, key: string, flag: Flag, on: boolean): Map<string, Flags> {
  const next = new Map(m);
  if (flag === 'read' && !on) {
    next.delete(key);
    return next;
  }
  const cur = m.get(key) ?? EMPTY_FLAGS;
  const f: Flags = { ...cur, [flag]: on, read: cur.read || on };
  if (f.read) next.set(key, f);
  else next.delete(key);
  return next;
}

/** Every offered cell of these rows on or off, skipping cells the editor may not grant. */
export function setRows(
  m: Matrix,
  keys: readonly string[],
  on: boolean,
  allowed: (key: string, flag: Flag) => boolean,
): Map<string, Flags> {
  let next = new Map(m);
  for (const key of keys) {
    // On: View first; off: View last, so the row is never dropped half way.
    const order = on ? flagsFor(key) : [...flagsFor(key)].reverse();
    for (const flag of order) if (allowed(key, flag)) next = setFlag(next, key, flag, on);
  }
  return next;
}

/** Selection state of these rows over their offered cells. DSA: one pass, O(rows x 5). */
export function state(m: Matrix, keys: readonly string[]): 'none' | 'some' | 'all' {
  let total = 0;
  let checked = 0;
  for (const key of keys) {
    const f = m.get(key);
    for (const flag of flagsFor(key)) {
      total++;
      if (f?.[flag]) checked++;
    }
  }
  return checked === 0 ? 'none' : checked === total ? 'all' : 'some';
}

/** Keys of the menus with a path under a node, at any depth. */
export function leafKeys(node: NavNode): string[] {
  return menuLeaves([node]).map((l) => l.key);
}

export function fromRole(menus: readonly RoleMenu[]): Map<string, Flags> {
  return new Map(menus.filter((m) => m.read).map(({ menuKey, ...f }) => [menuKey, f]));
}

export function toBody(m: Matrix): RoleMenu[] {
  return [...m].map(([menuKey, f]) => ({ menuKey, ...f }));
}

export function sameMatrix(a: Matrix, b: Matrix): boolean {
  if (a.size !== b.size) return false;
  for (const [k, f] of a) {
    const g = b.get(k);
    if (!g || FLAGS.some((x) => f[x] !== g[x])) return false;
  }
  return true;
}

/** What the signed-in user may grant: everything for an Admin, else what they hold. */
export function heldBy(auth: {
  isAdmin: boolean;
  can: (permission: string) => boolean;
  navigation: readonly NavNode[];
}): (key: string, flag: Flag) => boolean {
  if (auth.isAdmin) return () => true;
  const visible = new Set(menuLeaves(auth.navigation).map((l) => l.key));
  return (key, flag) =>
    flag === 'visible' ? visible.has(key) : auth.can(permissionKey(key, flag));
}
