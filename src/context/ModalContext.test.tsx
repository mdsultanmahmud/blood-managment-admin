import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ModalProvider } from './ModalContext';
import { useCurrentModal, useDirtyGuard, useModal, type ModalController } from './modalTypes';

function Grab({ onReady }: { onReady: (c: ModalController) => void }) {
  const controller = useModal();
  useEffect(() => {
    onReady(controller);
  }, [controller, onReady]);
  return null;
}

function setup(): ModalController {
  const box: { controller?: ModalController } = {};
  render(
    <ModalProvider>
      <button type="button">opener</button>
      <Grab
        onReady={(c) => {
          box.controller = c;
        }}
      />
    </ModalProvider>,
  );
  if (!box.controller) throw new Error('controller not ready');
  return box.controller;
}

const dialogs = () => screen.queryAllByRole('dialog');

describe('modal controller', () => {
  it('opens a stack; ESC closes only the top modal', async () => {
    const user = userEvent.setup();
    const m = setup();
    act(() => {
      void m.openModal({ title: 'First', content: <p>one</p> });
    });
    act(() => {
      void m.openModal({ type: 'drawer', title: 'Second', content: <p>two</p> });
    });
    expect(dialogs()).toHaveLength(2);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('two')).not.toBeInTheDocument());
    expect(screen.getByText('one')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(dialogs()).toHaveLength(0));
  });

  it('marks dialogs as modal and labels them by title', () => {
    const m = setup();
    act(() => {
      void m.openModal({ title: 'Assign role', content: <p>x</p> });
    });
    const dialog = screen.getByRole('dialog', { name: 'Assign role' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('resolves openModal with the result passed to close()', async () => {
    const user = userEvent.setup();
    const m = setup();
    function Picker() {
      const { close } = useCurrentModal<string>();
      return (
        <button type="button" onClick={() => close('picked')}>
          pick
        </button>
      );
    }
    let promise!: Promise<string | undefined>;
    act(() => {
      promise = m.openModal<string>({ title: 'Pick', content: <Picker /> });
    });
    await user.click(screen.getByRole('button', { name: 'pick' }));
    await expect(promise).resolves.toBe('picked');
  });

  it('confirm() resolves true on confirm and false on cancel or ESC', async () => {
    const user = userEvent.setup();
    const m = setup();

    let p!: Promise<boolean>;
    act(() => {
      p = m.confirm({ title: 'Delete role?', confirmLabel: 'Delete', tone: 'danger' });
    });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await expect(p).resolves.toBe(true);
    await waitFor(() => expect(dialogs()).toHaveLength(0));

    act(() => {
      p = m.confirm({ title: 'Delete role?', confirmLabel: 'Delete' });
    });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await expect(p).resolves.toBe(false);
    await waitFor(() => expect(dialogs()).toHaveLength(0));

    act(() => {
      p = m.confirm({ title: 'Delete role?' });
    });
    await user.keyboard('{Escape}');
    await expect(p).resolves.toBe(false);
  });

  it('non-dismissible modals ignore ESC and show no close button', async () => {
    const user = userEvent.setup();
    const m = setup();
    act(() => {
      void m.openModal({ title: 'Locked', dismissible: false, content: <p>stay</p> });
    });
    await user.keyboard('{Escape}');
    expect(screen.getByText('stay')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    act(() => m.closeAll());
    await waitFor(() => expect(dialogs()).toHaveLength(0));
  });

  it('dirty guard asks before discarding, and keeps the modal if declined', async () => {
    const user = userEvent.setup();
    const m = setup();
    function DirtyForm() {
      const [value, setValue] = useState('');
      useDirtyGuard(value !== '');
      return <input aria-label="name" value={value} onChange={(e) => setValue(e.target.value)} />;
    }
    act(() => {
      void m.openModal({ type: 'drawer', title: 'Create user', content: <DirtyForm /> });
    });
    await user.type(screen.getByLabelText('name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(await screen.findByRole('dialog', { name: 'Discard changes?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Discard changes?' })).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText('name')).toHaveValue('Ada');

    await user.keyboard('{Escape}');
    await user.click(await screen.findByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(dialogs()).toHaveLength(0));
  });

  it('locks body scroll while open and restores focus to the opener', async () => {
    const user = userEvent.setup();
    const m = setup();
    const opener = screen.getByRole('button', { name: 'opener' });
    opener.focus();
    act(() => {
      void m.openModal({ title: 'Focus', content: <input aria-label="field" /> });
    });
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByLabelText('field')).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(dialogs()).toHaveLength(0));
    expect(document.body.style.overflow).toBe('');
    expect(opener).toHaveFocus();
  });
});
