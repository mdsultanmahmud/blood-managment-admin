import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MultiCombobox } from './MultiCombobox';
import { MultiSelect } from './MultiSelect';

interface Role {
  id: string;
  name: string;
  off?: boolean;
}
const ROLES: Role[] = [
  { id: 'a', name: 'Admin', off: true },
  { id: 'd', name: 'Desk' },
  { id: 'v', name: 'Viewer' },
];

function Harness({ onChange }: { onChange?: (v: Role[]) => void }) {
  const [value, setValue] = useState<Role[]>([]);
  return (
    <MultiCombobox<Role>
      label="Roles"
      options={ROLES}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
      getOptionLabel={(r) => r.name}
      getOptionDisabled={(r) => Boolean(r.off)}
      isOptionEqualToValue={(a, b) => a.id === b.id}
    />
  );
}

describe('MultiCombobox', () => {
  it('picks several options and keeps the list open', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Roles' }));
    await userEvent.click(screen.getByRole('option', { name: 'Desk' }));
    await userEvent.click(screen.getByRole('option', { name: 'Viewer' }));
    expect(onChange).toHaveBeenLastCalledWith([ROLES[1], ROLES[2]]);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Desk' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows chosen options as removable chips', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Desk' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Desk' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('toggles an option off by choosing it again', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Desk' }));
    await userEvent.click(screen.getByRole('option', { name: 'Desk' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('does not select a disabled option', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Admin' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes the last chip with Backspace on empty text', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('option', { name: 'Desk' }));
    await userEvent.click(input);
    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('filters while typing and chooses with the keyboard', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'vie');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Viewer']);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith([ROLES[2]]);
  });

  it('keeps Escape inside the field while the list is open', async () => {
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <Harness />
      </div>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(outer).not.toHaveBeenCalled();
  });
});

const GROUPS = [
  { value: 'A_POS', label: 'A+' },
  { value: 'O_NEG', label: 'O−' },
  { value: 'B_POS', label: 'B+' },
];

function SelectHarness({ onChange }: { onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <MultiSelect
      label="Blood group"
      anyLabel="Any"
      options={GROUPS}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe('MultiSelect', () => {
  it('is named by its label and shows "Any" until something is chosen', () => {
    render(<SelectHarness />);
    const field = screen.getByRole('combobox', { name: 'Blood group' });
    expect(field).toHaveTextContent('Any');
    expect(field).toHaveAttribute('aria-expanded', 'false');
  });

  it('selects several values and summarises them', async () => {
    const onChange = vi.fn();
    render(<SelectHarness onChange={onChange} />);
    const field = screen.getByRole('combobox', { name: 'Blood group' });
    await userEvent.click(field);
    const list = screen.getByRole('listbox');
    await userEvent.click(within(list).getByRole('option', { name: 'A+' }));
    await userEvent.click(within(list).getByRole('option', { name: 'O−' }));
    expect(onChange).toHaveBeenLastCalledWith(['A_POS', 'O_NEG']);
    expect(field).toHaveTextContent('A+, O−');
    await userEvent.click(within(list).getByRole('option', { name: 'A+' }));
    expect(onChange).toHaveBeenLastCalledWith(['O_NEG']);
  });

  it('works from the keyboard and closes on Escape', async () => {
    const onChange = vi.fn();
    render(<SelectHarness onChange={onChange} />);
    const field = screen.getByRole('combobox', { name: 'Blood group' });
    field.focus();
    await userEvent.keyboard('{Enter}'); // opens
    await userEvent.keyboard('{ArrowDown}{Enter}'); // moves to O−, toggles it
    expect(onChange).toHaveBeenLastCalledWith(['O_NEG']);
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
