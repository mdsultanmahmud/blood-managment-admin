import { matchPath } from 'react-router';
import type { AppRoute, NavNode } from '@/api/schemas';
import { tx } from './translate';

export interface MenuLeaf {
  key: string;
  label: string;
  path: string;
}

/** Every menu with a path, at any depth. DSA: iterative depth-first walk with a stack, O(n). */
export function menuLeaves(nodes: readonly NavNode[]): MenuLeaf[] {
  const out: MenuLeaf[] = [];
  const stack = [...nodes].reverse();
  for (let n = stack.pop(); n; n = stack.pop()) {
    if (n.path) out.push({ key: n.key, label: n.label, path: n.path });
    stack.push(...[...n.children].reverse());
  }
  return out;
}

/** `menu.<key>` once translated, else the label configured in the App hub (ADR 0022). */
export function menuLabel(node: { key: string; label: string }): string {
  return tx(`menu.${node.key}`, node.label);
}

/**
 * The route whose path is the longest prefix of the address, segment-wise; `/` matches only
 * itself. Pages own the addresses below their path (`/admin/roles/new`).
 * DSA: linear scan keeping the longest match, O(r).
 */
export function findRoute(routes: readonly AppRoute[], pathname: string): AppRoute | null {
  let best: AppRoute | null = null;
  for (const r of routes) {
    const hit =
      r.path === '/'
        ? pathname === '/'
        : matchPath({ path: r.path, end: false }, pathname) !== null;
    if (hit && (!best || r.path.length > best.path.length)) best = r;
  }
  return best;
}

/** A route's name: its sidebar label when shown there, else its key, translated when possible. */
export function routeLabel(route: AppRoute, navigation: readonly NavNode[]): string {
  const leaf = menuLeaves(navigation).find((m) => m.key === route.key);
  return menuLabel({ key: route.key, label: leaf?.label ?? route.key });
}
