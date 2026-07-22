import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

function renderSidebar(role?: string) {
  return render(
    <MemoryRouter>
      <Sidebar role={role} />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('shows the Users link for an admin', () => {
    renderSidebar('admin');

    expect(screen.getByText('Користувачі')).toBeInTheDocument();
  });

  it('hides the Users link for an editor', () => {
    renderSidebar('editor');

    expect(screen.queryByText('Користувачі')).not.toBeInTheDocument();
  });

  it('hides the Users link while the role is not yet known', () => {
    renderSidebar(undefined);

    expect(screen.queryByText('Користувачі')).not.toBeInTheDocument();
  });

  it('shows role-agnostic links to everyone', () => {
    renderSidebar('editor');

    expect(screen.getByText('Пости')).toBeInTheDocument();
    expect(screen.getByText('Журнал дій')).toBeInTheDocument();
    expect(screen.getByText('Налаштування')).toBeInTheDocument();
  });
});
