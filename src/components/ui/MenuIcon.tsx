import { createElement } from 'react';
import { FALLBACK_ICON, iconFor } from '@/lib/iconRegistry';
import { parseReactIcon, useIconSet } from '@/lib/reactIcons';

/**
 * Renders a stored menu icon: a react-icons `set:Name` (its set is loaded on demand, with the
 * neutral icon shown meanwhile) or a shared registry key.
 */
export function MenuIcon({
  icon,
  className,
}: {
  icon: string | null | undefined;
  className?: string;
}) {
  const parsed = parseReactIcon(icon);
  const set = useIconSet(parsed?.set ?? null);
  const component = parsed
    ? (set?.icons.get(parsed.name) ?? FALLBACK_ICON)
    : iconFor(icon ?? undefined);
  return createElement(component, { className, 'aria-hidden': true });
}
