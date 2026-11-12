import { describe, expect, it } from 'vitest';
import { permissionKey } from './permissions';

describe('permissionKey', () => {
  it('joins the menu key and the action with a colon', () => {
    expect(permissionKey('blood_donars', 'create')).toBe('blood_donars:create');
  });
});
