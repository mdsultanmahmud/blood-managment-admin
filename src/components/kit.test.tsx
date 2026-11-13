import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { emailField } from '@/lib/validation';
import { FormPasswordField } from './form/FormPasswordField';
import { FormTextField } from './form/FormTextField';
import { DataGrid } from './grid/DataGrid';
import { GridFilterMulti } from './grid/GridControls';
import { Avatar } from './ui/Avatar';
import { ErrorState, LoadingState } from './ui/States';

const schema = z.object({ email: emailField, password: z.string() });

function EmailForm() {
  const { control, handleSubmit } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <FormTextField control={control} name="email" label="Email" />
      <FormPasswordField control={control} name="password" label="Password" />
      <button type="submit">Send</button>
    </form>
  );
}

describe('UI kit', () => {
  it('shows translated defaults', () => {
    render(
      <>
        <ErrorState onRetry={() => undefined} />
        <LoadingState />
      </>,
    );
    expect(screen.getByText('This could not be loaded')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getAllByText('Loading').length).toBeGreaterThan(0);
  });

  it('translates validation keys under form fields', async () => {
    render(<EmailForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Enter an email address')).toBeInTheDocument();
  });

  it('labels the password visibility toggle', async () => {
    render(<EmailForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });

  it('GridFilterMulti selects several values and reports them', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <GridFilterMulti
        label="Blood group"
        value={['A_POS']}
        onChange={onChange}
        options={[
          { value: 'A_POS', label: 'A+' },
          { value: 'O_NEG', label: 'O−' },
        ]}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Blood group' }));
    await user.click(await screen.findByRole('option', { name: 'O−' }));
    expect(onChange).toHaveBeenLastCalledWith(['A_POS', 'O_NEG']);
  });

  it('Avatar shows blob URLs as they are', () => {
    render(<Avatar name="Rahim" src="blob:http://localhost/abc" />);
    expect(screen.getByRole('img', { name: 'Rahim' })).toHaveAttribute(
      'src',
      'blob:http://localhost/abc',
    );
  });
});

describe('DataGrid toolbar row', () => {
  const grid = (toolbar?: React.ReactNode) => (
    <DataGrid<{ id: string }>
      id="kit"
      label="Kit"
      columnDefs={[{ colId: 'id', field: 'id', headerName: 'Id' }]}
      rows={[]}
      getRowId={(r) => r.id}
      columnsMenu={false}
      toolbar={toolbar}
      empty={<p>Nothing</p>}
    />
  );

  it('is left out when there is no toolbar and no columns menu', () => {
    const { container } = render(grid());
    expect(container.querySelector('[data-grid-toolbar]')).toBeNull();
  });

  it('is shown when a toolbar is given', () => {
    const { container } = render(grid(<button type="button">Filter</button>));
    expect(container.querySelector('[data-grid-toolbar]')).not.toBeNull();
  });
});
