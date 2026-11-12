import { describe, expect, it } from 'vitest';
import type { NavNode } from '@/api/schemas';
import {
  EMPTY_FLAGS,
  flagsFor,
  fromRole,
  heldBy,
  leafKeys,
  sameMatrix,
  setFlag,
  setRows,
  state,
  type Flags,
} from './matrix';

const on = (o: Partial<Flags>): Flags => ({ ...EMPTY_FLAGS, ...o });
const node = (key: string, path: string | null, children: NavNode[] = []): NavNode => ({
  key,
  label: key,
  icon: null,
  path,
  children,
});

describe('role matrix rules', () => {
  it('turns View on with any other flag, and clears the row without View', () => {
    let m = setFlag(new Map(), 'blood_donars', 'create', true);
    expect(m.get('blood_donars')).toEqual(on({ read: true, create: true }));
    m = setFlag(m, 'blood_donars', 'visible', true);
    m = setFlag(m, 'blood_donars', 'read', false);
    expect(m.has('blood_donars')).toBe(false);
  });

  it('offers only the operations a page declares', () => {
    expect(flagsFor('dashboard')).toEqual(['visible', 'read']);
    expect(flagsFor('staff_management')).toEqual(['visible', 'read', 'create', 'update']);
    expect(flagsFor('blood_donars')).toEqual(['visible', 'read', 'create', 'update', 'delete']);
  });

  it('selects whole rows and reports group state over offered cells only', () => {
    const keys = ['dashboard', 'blood_donars'];
    const all = setRows(new Map(), keys, true, () => true);
    expect(all.get('dashboard')).toEqual(on({ visible: true, read: true }));
    expect(state(all, keys)).toBe('all');
    expect(state(setFlag(all, 'blood_donars', 'delete', false), keys)).toBe('some');
    expect(state(new Map(), keys)).toBe('none');
    expect(setRows(all, keys, false, () => true).size).toBe(0);
  });

  it('never selects cells the editor may not grant', () => {
    const m = setRows(
      new Map(),
      ['blood_donars'],
      true,
      (_k, f) => f === 'read' || f === 'visible',
    );
    expect(m.get('blood_donars')).toEqual(on({ visible: true, read: true }));
  });

  it('round-trips the API shape and compares matrices', () => {
    const menus = [{ menuKey: 'blood_donars', ...on({ read: true, update: true }) }];
    const m = fromRole(menus);
    expect([...m].map(([menuKey, f]) => ({ menuKey, ...f }))).toEqual(menus);
    expect(sameMatrix(m, fromRole(menus))).toBe(true);
    expect(sameMatrix(m, new Map())).toBe(false);
    expect(sameMatrix(m, setFlag(m, 'blood_donars', 'delete', true))).toBe(false);
  });

  it('collects the leaves under a group at any depth', () => {
    const g = node('g', null, [node('a', '/a'), node('h', null, [node('b', '/b')])]);
    expect(leafKeys(g)).toEqual(['a', 'b']);
  });

  it('knows what a non-Admin holds', () => {
    const held = heldBy({
      isAdmin: false,
      can: (p) => p === 'blood_donars:read',
      navigation: [node('blood_donars', '/b')],
    });
    expect(held('blood_donars', 'read')).toBe(true);
    expect(held('blood_donars', 'visible')).toBe(true);
    expect(held('blood_donars', 'create')).toBe(false);
    expect(heldBy({ isAdmin: true, can: () => false, navigation: [] })('x', 'delete')).toBe(true);
  });
});
