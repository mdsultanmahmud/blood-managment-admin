import { createContext, useContext, useEffect, type ReactNode } from 'react';

export type ModalType = 'dialog' | 'drawer';
export type ModalSize = 'sm' | 'md' | 'lg';

/** Handed to modal content (render-function arg, or via useCurrentModal()). */
export interface ModalApi<R = unknown> {
  id: string;
  /** Close and resolve openModal's promise with `result`. Skips the dirty guard. */
  close: (result?: R) => void;
  /** User-initiated close (X, ESC, backdrop): asks first if the content is dirty. */
  requestClose: () => void;
  /** Content reports unsaved changes (e.g. react-hook-form isDirty). */
  setDirty: (dirty: boolean) => void;
}

export interface OpenModalOptions<R = unknown> {
  type?: ModalType;
  size?: ModalSize;
  title: ReactNode;
  description?: ReactNode;
  content: ReactNode | ((api: ModalApi<R>) => ReactNode);
  /** ESC, backdrop click and the X button close it. Default true. */
  dismissible?: boolean;
  /** Close on backdrop click (only if dismissible). Default true for dialogs and drawers. */
  closeOnBackdrop?: boolean;
  onClose?: (result: R | undefined) => void;
}

export interface ConfirmOptions {
  title: ReactNode;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
}

export interface ModalController {
  openModal: <R = unknown>(options: OpenModalOptions<R>) => Promise<R | undefined>;
  /** Closes a modal by id (or the top one) without the dirty guard. */
  closeModal: (id?: string, result?: unknown) => void;
  closeAll: () => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ModalControllerContext = createContext<ModalController | null>(null);
export const CurrentModalContext = createContext<ModalApi | null>(null);

export function useModal(): ModalController {
  const ctx = useContext(ModalControllerContext);
  if (!ctx) throw new Error('useModal must be used inside ModalProvider');
  return ctx;
}

/** Inside modal content: close with a result, request close, mark dirty. */
export function useCurrentModal<R = unknown>(): ModalApi<R> {
  const ctx = useContext(CurrentModalContext);
  if (!ctx) throw new Error('useCurrentModal must be used inside modal content');
  return ctx;
}

/**
 * Dirty-form guard: report unsaved changes so closing the modal asks first. No-op outside a modal,
 * so forms can call it unconditionally.
 */
export function useDirtyGuard(isDirty: boolean): void {
  const ctx = useContext(CurrentModalContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setDirty(isDirty);
    return () => ctx.setDirty(false);
  }, [ctx, isDirty]);
}
