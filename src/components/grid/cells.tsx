import type { ReactNode } from 'react';
import { LuEllipsis } from 'react-icons/lu';
import i18n from 'i18next';
import { formatDate, formatDateTime, formatRelative } from '@/lib/format';
import { Avatar } from '../ui/Avatar';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Menu, type MenuItemDef } from '../ui/Menu';

/** Avatar + name (+ secondary line). Used for staff users and audit actors. */
export function AvatarNameCell({
  name,
  avatarUrl,
  secondary,
  badge,
}: {
  name: string;
  avatarUrl?: string | null;
  secondary?: string;
  badge?: ReactNode;
}) {
  return (
    <span className="flex h-full min-w-0 items-center gap-2.5">
      <Avatar name={name} src={avatarUrl ?? null} size={28} />
      <span className="min-w-0 leading-tight">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-medium text-neutral-900">{name}</span>
          {badge}
        </span>
        {secondary && <span className="block truncate text-xs text-neutral-500">{secondary}</span>}
      </span>
    </span>
  );
}

export function StatusCell({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span className="flex h-full items-center">
      <Badge tone={tone} dot>
        {label}
      </Badge>
    </span>
  );
}

/** Relative date with the exact time on hover. */
export function DateCell({
  value,
  empty,
  withTime = false,
}: {
  value: string | null | undefined;
  empty?: string;
  withTime?: boolean;
}) {
  if (!value)
    return <span className="text-neutral-400">{empty ?? i18n.t('common.grid.never')}</span>;
  return (
    <time dateTime={value} title={formatDateTime(value)} className="tabular-nums">
      {withTime ? formatDateTime(value) : formatRelative(value)}
      {!withTime && <span className="sr-only"> ({formatDate(value)})</span>}
    </time>
  );
}

export function ChipsCell({
  items,
  empty,
}: {
  items: { id: string; label: string; tone?: BadgeTone }[];
  empty?: string;
}) {
  if (items.length === 0)
    return <span className="text-neutral-400">{empty ?? i18n.t('common.grid.none')}</span>;
  return (
    <span className="flex h-full items-center gap-1 overflow-hidden">
      {items.slice(0, 3).map((i) => (
        <Badge key={i.id} tone={i.tone ?? 'neutral'}>
          {i.label}
        </Badge>
      ))}
      {items.length > 3 && <span className="text-xs text-neutral-500">+{items.length - 3}</span>}
    </span>
  );
}

/**
 * Row actions. Callers pass only the actions the user may perform (filtered with can());
 * the cell disappears when nothing is left. Clicks don't trigger row navigation.
 */
export function ActionsCell({ label, items }: { label: string; items: MenuItemDef[] }) {
  if (items.length === 0) return null;
  return (
    <span data-row-action className="flex h-full items-center justify-end">
      <Menu
        label={label}
        items={items}
        trigger={({ open, id }) => (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? id : undefined}
            aria-label={label}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <LuEllipsis aria-hidden />
          </button>
        )}
      />
    </span>
  );
}
