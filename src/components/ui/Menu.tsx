import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

export interface MenuItemDef {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  /** Shown instead of the item when disabled with a reason. */
  hint?: string;
}

const GAP = 6;
const VIEWPORT_MARGIN = 8;

/**
 * Accessible dropdown menu (menu button pattern): Enter/Space/ArrowDown opens, arrows move,
 * Escape closes and returns focus to the trigger.
 *
 * The panel is portalled to <body> with fixed positioning, so containers that clip overflow
 * (AG Grid cells, cards, scroll areas) never hide it. It opens below the trigger, or above
 * when there is not enough room, and follows the trigger on scroll and resize.
 */
export function Menu({
  trigger,
  label,
  items,
  align = 'end',
  header,
}: {
  trigger: (props: { open: boolean; id: string }) => ReactNode;
  label: string;
  items: MenuItemDef[];
  align?: 'start' | 'end';
  header?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();

  const close = () => setOpen(false);
  const openMenu = () => setOpen(true);

  /**
   * Places the panel next to the trigger (below, or above when it does not fit) by writing
   * directly to its style, so scroll updates do not re-render. Returns the side used, or null
   * when the trigger scrolled out of view (the menu then closes).
   */
  const place = useCallback((): 'below' | 'above' | null => {
    const trigger = rootRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return null;
    const anchor = trigger.getBoundingClientRect();
    if (anchor.bottom < 0 || anchor.top > window.innerHeight) {
      setOpen(false);
      return null;
    }
    const h = menu.offsetHeight;
    const w = menu.offsetWidth;
    const fitsBelow = anchor.bottom + GAP + h <= window.innerHeight - VIEWPORT_MARGIN;
    const fitsAbove = anchor.top - GAP - h >= VIEWPORT_MARGIN;
    const above = !fitsBelow && fitsAbove;
    const top = above ? anchor.top - GAP - h : anchor.bottom + GAP;
    const rawLeft = align === 'end' ? anchor.right - w : anchor.left;
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, rawLeft),
      window.innerWidth - w - VIEWPORT_MARGIN,
    );
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = 'visible';
    return above ? 'above' : 'below';
  }, [align]);

  // First placement happens before paint, once the panel exists and can be measured.
  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const inside = (t: EventTarget | null) =>
      t instanceof Node && (rootRef.current?.contains(t) || menuRef.current?.contains(t));
    const onDown = (e: MouseEvent) => {
      if (!inside(e.target)) close();
    };
    // Follow the trigger when the page or a grid scrolls (AG Grid scrolls cells into view).
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        place();
      });
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
    };
  }, [open, place]);

  useEffect(() => {
    if (open) itemRefs.current.find((el) => el && !el.disabled)?.focus({ preventScroll: true });
  }, [open]);

  const focusTrigger = () =>
    rootRef.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();

  const onMenuKey = (e: KeyboardEvent) => {
    const enabled = itemRefs.current.filter((el): el is HTMLButtonElement => !!el && !el.disabled);
    const idx = enabled.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = (idx + (e.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
      enabled[next]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      (e.key === 'Home' ? enabled[0] : enabled.at(-1))?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
      focusTrigger();
    } else if (e.key === 'Tab') {
      close();
      focusTrigger();
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative inline-flex"
      onKeyDown={(e) => {
        if (
          !open &&
          e.key === 'ArrowDown' &&
          (e.target as HTMLElement).hasAttribute('aria-haspopup')
        ) {
          e.preventDefault();
          openMenu();
        }
      }}
    >
      <span
        className="inline-flex"
        onClick={() => (open ? close() : openMenu())}
        aria-hidden={false}
      >
        {trigger({ open, id })}
      </span>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              id={id}
              role="menu"
              aria-label={label}
              onKeyDown={onMenuKey}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: reduce ? 0 : 0.12 }}
              className="invisible fixed top-0 left-0 z-[1250] min-w-[200px] rounded-md border border-neutral-200 bg-surface py-1 shadow-layer"
            >
              {header && <div className="border-b border-neutral-200 px-3 py-2.5">{header}</div>}
              {items.map((item, i) => (
                <button
                  key={item.key}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={item.disabled}
                  title={item.disabled ? item.hint : undefined}
                  onClick={() => {
                    close();
                    item.onSelect();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm outline-none',
                    'focus:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50',
                    item.tone === 'danger'
                      ? 'text-danger-700 hover:bg-danger-50 focus:bg-danger-50'
                      : 'text-neutral-800 hover:bg-neutral-100',
                  )}
                >
                  {item.icon && (
                    <span className="inline-flex text-base opacity-80" aria-hidden>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
