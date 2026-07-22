import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { mockUseParams } = vi.hoisted(() => ({ mockUseParams: vi.fn().mockReturnValue({}) }));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => mockUseParams(),
  useBlocker: () => ({ state: 'unblocked', proceed: vi.fn(), reset: vi.fn() }),
}));

vi.mock('../../../services/api', () => ({
  postService: { getById: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/admin/page-builder/PageBuilder', () => ({
  default: () => <div data-testid="page-builder" />,
}));
vi.mock('../../../components/admin/GalleryUploader', () => ({
  default: () => <div data-testid="gallery-uploader" />,
}));
vi.mock('../../../components/admin/SeoFields', () => ({
  default: () => <div data-testid="seo-fields" />,
}));
vi.mock('../../../components/admin/PostHeroForm', () => ({
  default: () => <div data-testid="post-hero-form" />,
}));
vi.mock('../../../components/admin/PostHeroPreview', () => ({
  default: () => <div data-testid="post-hero-preview" />,
}));

import EditPostPage from '../EditPostPage';

beforeEach(() => {
  mockUseParams.mockReturnValue({});
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <EditPostPage />
    </QueryClientProvider>
  );
}

describe('EditPostPage', () => {
  it('defaults status to draft and switches to published on selection', () => {
    renderPage();

    const draftRadio = screen.getByRole('radio', { name: 'Чернетка' });
    const publishedRadio = screen.getByRole('radio', { name: 'Опубліковано' });
    expect(draftRadio).toBeChecked();
    expect(publishedRadio).not.toBeChecked();

    fireEvent.click(publishedRadio);

    expect(publishedRadio).toBeChecked();
    expect(draftRadio).not.toBeChecked();
  });

  it('toggles the featured switch', () => {
    renderPage();
    const featuredSwitch = screen.getByRole('switch');
    expect(featuredSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(featuredSwitch);

    expect(featuredSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('shows "Синхронізувати" when the slug is locked by manual edits, and "Авто" once unlocked', () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('url-adresa-storinky'), {
      target: { value: 'custom-slug' },
    });
    expect(screen.getByText('Синхронізувати')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Синхронізувати'));
    expect(screen.getByText('Авто')).toBeInTheDocument();
  });

  it('auto-generates the slug from the title until the slug is manually locked', () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Введіть назву сторінки'), {
      target: { value: 'Новий проєкт' },
    });

    expect(screen.getByPlaceholderText('url-adresa-storinky')).toHaveValue('novyy-proyekt');
  });

  it('titles the page "Нова сторінка" for a new post and "Редагувати сторінку" when editing', async () => {
    const { unmount } = renderPage();
    expect(screen.getByText('Нова сторінка')).toBeInTheDocument();
    unmount();

    mockUseParams.mockReturnValue({ id: 'post-1' });
    const { postService } = await import('../../../services/api');
    vi.mocked(postService.getById).mockResolvedValue({
      post: {
        id: 'post-1',
        title: 'Existing',
        slug: 'existing',
        status: 'draft',
        created_at: '',
        updated_at: '',
      },
      blocks: [],
    } as never);

    renderPage();

    await waitFor(() => expect(screen.getByText('Редагувати сторінку')).toBeInTheDocument());
  });
});
