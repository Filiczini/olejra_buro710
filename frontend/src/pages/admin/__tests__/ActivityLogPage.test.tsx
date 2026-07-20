import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ActivityLog } from '@buro710/shared';

vi.mock('../../../services/api', () => ({
  activityLogService: { getAll: vi.fn(), getUniqueUsers: vi.fn() },
}));
vi.mock('../../../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import ActivityLogPage from '../ActivityLogPage';
import { activityLogService } from '../../../services/api';

function makeLog(overrides: Partial<ActivityLog> = {}): ActivityLog {
  return {
    id: 'log-1',
    user_email: 'diana@b710.design',
    action: 'update',
    entity_type: 'post',
    entity_id: 'p1',
    entity_title: 'First post',
    changes: {},
    created_at: '2026-07-18T10:00:00.000Z',
    ...overrides,
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ActivityLogPage />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(activityLogService.getUniqueUsers).mockResolvedValue([]);
});

describe('ActivityLogPage', () => {
  it('renders fetched log rows', async () => {
    vi.mocked(activityLogService.getAll).mockResolvedValue({
      data: [makeLog()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    renderPage();

    await waitFor(() => expect(screen.getByText('diana@b710.design')).toBeInTheDocument());
    expect(screen.getByText('First post')).toBeInTheDocument();
  });

  it('populates the user filter from useUniqueUsers and refetches on selection', async () => {
    vi.mocked(activityLogService.getAll).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    vi.mocked(activityLogService.getUniqueUsers).mockResolvedValue(['diana@b710.design']);

    renderPage();

    await waitFor(() =>
      expect(
        within(screen.getByLabelText('Користувач')).getByText('diana@b710.design')
      ).toBeInTheDocument()
    );

    fireEvent.change(screen.getByLabelText('Користувач'), {
      target: { value: 'diana@b710.design' },
    });

    await waitFor(() =>
      expect(activityLogService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ user_email: 'diana@b710.design' })
      )
    );
  });

  it('filters by action type', async () => {
    vi.mocked(activityLogService.getAll).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    renderPage();
    await waitFor(() => expect(activityLogService.getAll).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText('Тип дії'), { target: { value: 'delete' } });

    await waitFor(() =>
      expect(activityLogService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'delete' })
      )
    );
  });

  it('resets filters and page when "Очистити фільтри" is clicked', async () => {
    vi.mocked(activityLogService.getAll).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    renderPage();
    await waitFor(() => expect(activityLogService.getAll).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText('Тип дії'), { target: { value: 'delete' } });
    await waitFor(() =>
      expect(activityLogService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'delete' })
      )
    );

    fireEvent.click(screen.getByRole('button', { name: 'Очистити фільтри' }));

    await waitFor(() =>
      expect(activityLogService.getAll).toHaveBeenLastCalledWith({ page: 1, limit: 20 })
    );
  });

  it('shows the empty-state message when there are no logs', async () => {
    vi.mocked(activityLogService.getAll).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    renderPage();

    await waitFor(() => expect(screen.getByText('Журнал порожній')).toBeInTheDocument());
  });
});
