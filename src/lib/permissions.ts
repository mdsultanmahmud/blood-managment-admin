/** Actions of the app permission model (ADR 0021). */
export const APP_ACTIONS = ['read', 'create', 'update', 'delete'] as const;
export type AppAction = (typeof APP_ACTIONS)[number];

/** `permissionKey('blood_donars', 'create')` is `'blood_donars:create'`, as GET /me returns. */
export function permissionKey(menuKey: string, action: AppAction): string {
  return `${menuKey}:${action}`;
}
