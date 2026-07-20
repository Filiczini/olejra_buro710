import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable, { type ColumnDef } from '../DataTable';

interface Row {
  id: string;
  name: string;
}

const rows: Row[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
];

const columns: ColumnDef<Row>[] = [{ key: 'name', header: 'Name', cell: (row) => row.name }];

describe('DataTable', () => {
  it('renders a row per item using the provided cell renderer', () => {
    render(<DataTable data={rows} columns={columns} rowKey={(r) => r.id} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows the empty message when there is no data', () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        rowKey={(r) => r.id}
        emptyMessage="Нічого не знайдено"
      />
    );

    expect(screen.getByText('Нічого не знайдено')).toBeInTheDocument();
  });

  it('shows a loading row instead of data while isLoading', () => {
    render(<DataTable data={rows} columns={columns} rowKey={(r) => r.id} isLoading />);

    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('toggles an individual row via onSelectionChange', () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowSelectable
        selectedIds={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Вибрати рядок' })[0]);

    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('deselects a row that is already selected', () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowSelectable
        selectedIds={['1']}
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Вибрати рядок' })[0]);

    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('select-all selects every row, and clicking again clears the selection', () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowSelectable
        selectedIds={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Вибрати всі рядки' }));
    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2']);

    rerender(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowSelectable
        selectedIds={['1', '2']}
        onSelectionChange={onSelectionChange}
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Вибрати всі рядки' }));

    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('shows bulk actions only once rows are selected, and invokes them with the selected ids', () => {
    const onBulkDelete = vi.fn();
    const { rerender } = render(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowSelectable
        selectedIds={[]}
        onSelectionChange={vi.fn()}
        bulkActions={[{ label: 'Видалити', onClick: onBulkDelete, variant: 'danger' }]}
      />
    );
    expect(screen.queryByRole('button', { name: 'Видалити' })).not.toBeInTheDocument();

    rerender(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowSelectable
        selectedIds={['1']}
        onSelectionChange={vi.fn()}
        bulkActions={[{ label: 'Видалити', onClick: onBulkDelete, variant: 'danger' }]}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

    expect(onBulkDelete).toHaveBeenCalledWith(['1']);
  });
});
