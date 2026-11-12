import i18n from 'i18next';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ConfirmDialogContent } from '@/components/modal/ConfirmDialog';
import { ModalHost, type ModalEntry } from '@/components/modal/ModalHost';
import {
  ModalControllerContext,
  type ConfirmOptions,
  type ModalController,
  type OpenModalOptions,
} from './modalTypes';

let seq = 0;

/**
 * Global modal controller. Keeps a stack of dialogs/drawers; only the top one is interactive.
 * openModal() returns a promise that resolves with the result passed to close().
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<ModalEntry[]>([]);
  const resolvers = useRef(new Map<string, (result: unknown) => void>());
  const dirty = useRef(new Set<string>());

  // Mirror of the stack for callbacks, so state updaters stay pure (StrictMode runs them twice).
  const stackRef = useRef<ModalEntry[]>([]);
  const update = useCallback((next: (s: ModalEntry[]) => ModalEntry[]) => {
    stackRef.current = next(stackRef.current);
    setStack(stackRef.current);
  }, []);

  const finish = useCallback(
    (id: string, result: unknown) => {
      const entry = stackRef.current.find((e) => e.id === id);
      if (!entry) return;
      update((s) => s.filter((e) => e.id !== id));
      entry.options.onClose?.(result);
      dirty.current.delete(id);
      const resolve = resolvers.current.get(id);
      resolvers.current.delete(id);
      resolve?.(result);
    },
    [update],
  );

  const openModal = useCallback(
    <R,>(options: OpenModalOptions<R>) => {
      const id = `modal-${++seq}`;
      return new Promise<R | undefined>((resolve) => {
        resolvers.current.set(id, resolve as (r: unknown) => void);
        update((s) => [...s, { id, options: options as OpenModalOptions }]);
      });
    },
    [update],
  );

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      openModal<boolean>({
        type: 'dialog',
        size: 'sm',
        title: options.title,
        content: <ConfirmDialogContent {...options} />,
      }).then((r) => r === true),
    [openModal],
  );

  const requestClose = useCallback(
    async (id: string) => {
      if (dirty.current.has(id)) {
        const discard = await confirm({
          title: i18n.t('common.dirty.title'),
          message: i18n.t('common.dirty.message'),
          confirmLabel: i18n.t('common.actions.discard'),
          cancelLabel: i18n.t('common.actions.keepEditing'),
          tone: 'danger',
        });
        if (!discard) return;
      }
      finish(id, undefined);
    },
    [confirm, finish],
  );

  const setDirty = useCallback((id: string, isDirty: boolean) => {
    if (isDirty) dirty.current.add(id);
    else dirty.current.delete(id);
  }, []);

  const closeModal = useCallback(
    (id?: string, result?: unknown) => {
      const target = id ?? stackRef.current.at(-1)?.id;
      if (target) finish(target, result);
    },
    [finish],
  );

  const closeAll = useCallback(() => {
    for (const e of [...stackRef.current].reverse()) finish(e.id, undefined);
  }, [finish]);

  // Body scroll lock while any modal is open.
  const open = stack.length > 0;
  useEffect(() => {
    if (!open) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  const controller = useMemo<ModalController>(
    () => ({ openModal, closeModal, closeAll, confirm }),
    [openModal, closeModal, closeAll, confirm],
  );

  return (
    <ModalControllerContext.Provider value={controller}>
      {children}
      <ModalHost
        stack={stack}
        onClose={finish}
        onRequestClose={(id) => void requestClose(id)}
        onSetDirty={setDirty}
      />
    </ModalControllerContext.Provider>
  );
}
