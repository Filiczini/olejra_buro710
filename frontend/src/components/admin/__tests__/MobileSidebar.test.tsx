import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileSidebar from '../MobileSidebar';

function renderMobileSidebar(role?: string) {
  return render(
    <MemoryRouter>
      <MobileSidebar isOpen onClose={vi.fn()} role={role} />
    </MemoryRouter>
  );
}

describe('MobileSidebar', () => {
  it('shows the Users link for an admin', () => {
    renderMobileSidebar('admin');

    expect(screen.getByText('Користувачі')).toBeInTheDocument();
  });

  it('hides the Users link for an editor', () => {
    renderMobileSidebar('editor');

    expect(screen.queryByText('Користувачі')).not.toBeInTheDocument();
  });

  it('shows role-agnostic links to everyone', () => {
    renderMobileSidebar('editor');

    expect(screen.getByText('Пости')).toBeInTheDocument();
    expect(screen.getByText('Журнал дій')).toBeInTheDocument();
  });
});
