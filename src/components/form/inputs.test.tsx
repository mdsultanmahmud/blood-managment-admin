import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, Switch } from './Checkbox';
import { Combobox } from './Combobox';
import { MenuItem, TextField } from './TextField';

describe('TextField', () => {
  it('ties the label to the input and reports typing', async () => {
    const onChange = vi.fn();
    render(<TextField label="Name" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Name'), 'A');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows an error state with the helper text wired for screen readers', () => {
    render(<TextField label="Email" error helperText="Enter a valid email" value="x" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email');
  });

  it('marks required fields and renders adornments', () => {
    render(
      <TextField
        label="Phone"
        required
        startAdornment={<span>+88</span>}
        endAdornment={<i>ok</i>}
      />,
    );
    expect(screen.getByLabelText(/Phone/)).toBeRequired();
    expect(screen.getByText('+88')).toBeInTheDocument();
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('renders a native select from MenuItems and reports the choice', async () => {
    const onChange = vi.fn();
    render(
      <TextField select label="Status" value="A" onChange={onChange}>
        <MenuItem value="A">Active</MenuItem>
        <MenuItem value="D">Disabled</MenuItem>
      </TextField>,
    );
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'D');
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('option', { name: 'Disabled' })).toBeInTheDocument();
  });

  it('shows a blank select, not the first option, when the value is empty', () => {
    render(
      <TextField select label="App" value="">
        <MenuItem value="a">Alpha</MenuItem>
      </TextField>,
    );
    expect(screen.getByLabelText<HTMLSelectElement>('App').value).toBe('');
  });

  it('keeps an explicit "any" option selectable when its value is empty', () => {
    render(
      <TextField select label="Filter" value="">
        <MenuItem value="">Any</MenuItem>
        <MenuItem value="a">Alpha</MenuItem>
      </TextField>,
    );
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
});

describe('Checkbox and Switch', () => {
  it('sets the mixed state without changing the checked value', () => {
    render(<Checkbox aria-label="All" checked={false} indeterminate onChange={() => undefined} />);
    const box = screen.getByRole<HTMLInputElement>('checkbox', { name: 'All' });
    expect(box.indeterminate).toBe(true);
    expect(box.checked).toBe(false);
  });

  it('toggles and honours disabled', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Checkbox aria-label="Opt in" onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Opt in' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    rerender(<Checkbox aria-label="Opt in" disabled onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Opt in' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('exposes a switch role with the on/off state', async () => {
    function Demo() {
      const [on, setOn] = useState(false);
      return <Switch aria-label="Active" checked={on} onChange={(e) => setOn(e.target.checked)} />;
    }
    render(<Demo />);
    const sw = screen.getByRole('switch', { name: 'Active' });
    expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    expect(sw).toBeChecked();
  });
});

interface Fruit {
  id: number;
  name: string;
  off?: boolean;
}
const FRUITS: Fruit[] = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana', off: true },
  { id: 3, name: 'Cherry' },
];

function Harness({ onPick }: { onPick?: (f: Fruit | null) => void }) {
  const [value, setValue] = useState<Fruit | null>(null);
  return (
    <Combobox<Fruit>
      label="Fruit"
      options={FRUITS}
      value={value}
      onChange={(f) => {
        setValue(f);
        onPick?.(f);
      }}
      getOptionLabel={(f) => f.name}
      getOptionDisabled={(f) => Boolean(f.off)}
      isOptionEqualToValue={(a, b) => a.id === b.id}
    />
  );
}

describe('Combobox', () => {
  it('is a labelled combobox that opens a listbox on click', async () => {
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('filters as you type and shows the empty message', async () => {
    render(<Harness />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'ch');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Cherry']);
    await userEvent.clear(input);
    await userEvent.type(input, 'zzz');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('chooses with the keyboard, skipping disabled options', async () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}'); // Apple is active on open; this moves past disabled Banana
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith(FRUITS[2]);
    expect(input).toHaveValue('Cherry');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('chooses with the mouse and can clear the value', async () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(onPick).toHaveBeenLastCalledWith(FRUITS[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onPick).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('does not select a disabled option', async () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onPick).not.toHaveBeenCalled();
  });

  it('closes on Escape without letting the key reach an enclosing dialog', async () => {
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
    // With the list already closed, Escape is free to reach the dialog.
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(outer).toHaveBeenCalledTimes(1);
  });

  it('shows the loading text instead of options while loading', async () => {
    render(
      <Combobox<Fruit>
        label="Fruit"
        options={[]}
        value={null}
        onChange={() => undefined}
        loading
        loadingText="Loading fruit…"
        getOptionLabel={(f) => f.name}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Loading fruit…')).toBeInTheDocument();
  });
});
