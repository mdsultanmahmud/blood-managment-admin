import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { NavNode } from '@/api/schemas';
import { Checkbox } from '@/components/form/Checkbox';
import { cn } from '@/lib/cn';
import { menuLabel } from '@/lib/menus';
import {
  FLAGS,
  flagsFor,
  leafKeys,
  setFlag,
  setRows,
  state,
  type Flag,
  type Matrix,
} from './matrix';

/** Column labels as static keys, so the key test sees every one. */
const FLAG_LABEL = {
  visible: 'roles.matrix.flag.visible',
  read: 'roles.matrix.flag.read',
  create: 'roles.matrix.flag.create',
  update: 'roles.matrix.flag.update',
  delete: 'roles.matrix.flag.delete',
} as const satisfies Record<Flag, string>;

interface Props {
  tree: readonly NavNode[];
  value: Matrix;
  onChange: (next: Matrix) => void;
  /** Whether the editor may grant this cell (everything for an Admin). */
  held: (key: string, flag: Flag) => boolean;
  readOnly?: boolean;
}

/**
 * The role matrix (ADR 0023): rows follow the usable menu tree as the sidebar shows it, at any
 * depth; groups are row headers whose checkbox covers every cell below. Cells a page does not
 * offer show a dash; cells the editor does not hold are disabled with the reason on hover.
 */
export function RoleMatrix({ tree, value, onChange, held, readOnly = false }: Props) {
  const { t } = useTranslation();
  const flagLabel = (f: Flag) => t(FLAG_LABEL[f]);

  const rows = (nodes: readonly NavNode[], depth: number): ReactNode[] =>
    nodes.flatMap((n) => {
      const name = menuLabel(n);
      const indent = { paddingLeft: `${0.5 + depth * 1.25}rem` };
      if (n.path === null) {
        const keys = leafKeys(n);
        const s = state(value, keys);
        return [
          <tr key={n.key} className="border-b border-neutral-200 bg-neutral-50/60">
            <th
              scope="rowgroup"
              colSpan={FLAGS.length + 1}
              className="py-1 pr-2 text-left"
              style={indent}
            >
              <label className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-semibold text-neutral-900">
                <Checkbox
                  checked={s === 'all'}
                  indeterminate={s === 'some'}
                  disabled={readOnly}
                  onChange={(e) => onChange(setRows(value, keys, e.target.checked, held))}
                  aria-label={t('roles.matrix.selectAll', { name })}
                />
                {name}
              </label>
            </th>
          </tr>,
          ...rows(n.children, depth + 1),
        ];
      }
      const offered = new Set(flagsFor(n.key));
      const s = state(value, [n.key]);
      const f = value.get(n.key);
      return [
        <tr
          key={n.key}
          className="border-b border-neutral-100 last:border-neutral-200 hover:bg-primary-50/40"
        >
          <th scope="row" className="py-1 pr-2 text-left font-normal" style={indent}>
            <label className="flex cursor-pointer items-center gap-1">
              <Checkbox
                checked={s === 'all'}
                indeterminate={s === 'some'}
                disabled={readOnly}
                onChange={(e) => onChange(setRows(value, [n.key], e.target.checked, held))}
                aria-label={t('roles.matrix.selectRow', { name })}
              />
              <span className="min-w-0">
                <span className="block text-neutral-900">{name}</span>
                <span className="block font-mono text-[11px] text-neutral-500">{n.key}</span>
              </span>
            </label>
          </th>
          {FLAGS.map((flag, i) => {
            const divider = i === 2 && 'border-l border-neutral-200';
            if (!offered.has(flag)) {
              return (
                <td key={flag} className={cn('text-center text-xs text-neutral-400', divider)}>
                  <span title={t('roles.matrix.notOffered')}>
                    <span aria-hidden>–</span>
                    <span className="sr-only">{t('roles.matrix.notOffered')}</span>
                  </span>
                </td>
              );
            }
            const mayGrant = held(n.key, flag);
            return (
              <td key={flag} className={cn('text-center', divider)}>
                <span title={!readOnly && !mayGrant ? t('roles.matrix.notHeld') : undefined}>
                  <Checkbox
                    checked={Boolean(f?.[flag])}
                    disabled={readOnly || !mayGrant}
                    onChange={(e) => onChange(setFlag(value, n.key, flag, e.target.checked))}
                    aria-label={t('roles.matrix.cell', { menu: name, flag: flagLabel(flag) })}
                  />
                </span>
              </td>
            );
          })}
        </tr>,
      ];
    });

  return (
    <div>
      <div className="overflow-x-auto rounded-sm border border-neutral-200 bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <caption className="sr-only">{t('roles.matrix.caption')}</caption>
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th
                scope="col"
                className="w-[40%] px-4 py-2.5 text-left text-xs font-semibold text-neutral-700"
              >
                {t('roles.matrix.menu')}
              </th>
              {FLAGS.map((f, i) => (
                <th
                  key={f}
                  scope="col"
                  className={cn(
                    'px-2 py-2.5 text-center text-xs font-semibold text-neutral-700',
                    i === 2 && 'border-l border-neutral-200',
                  )}
                >
                  {flagLabel(f)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows(tree, 0)}</tbody>
        </table>
      </div>
      <p className="mt-2.5 text-xs text-neutral-600">{t('roles.matrix.rule')}</p>
    </div>
  );
}
