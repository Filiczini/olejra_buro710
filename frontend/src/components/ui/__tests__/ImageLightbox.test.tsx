import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ImageLightbox from '../ImageLightbox';

const images = ['a.jpg', 'b.jpg', 'c.jpg'];

describe('ImageLightbox', () => {
  it('shows the current image and its position', () => {
    render(
      <ImageLightbox
        images={images}
        currentIndex={1}
        onClose={vi.fn()}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', 'b.jpg');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('calls onNext/onPrev when the arrow buttons are clicked', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <ImageLightbox
        images={images}
        currentIndex={1}
        onClose={vi.fn()}
        onPrev={onPrev}
        onNext={onNext}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Попереднє' }));
    fireEvent.click(screen.getByRole('button', { name: 'Наступне' }));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('navigates with ArrowLeft/ArrowRight keys', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <ImageLightbox
        images={images}
        currentIndex={1}
        onClose={vi.fn()}
        onPrev={onPrev}
        onNext={onNext}
      />
    );

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('does not close immediately on Escape, but starts the fade-out animation', async () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog').className).toContain('animate-fade-out');
  });

  it('does not start closing when the image itself is clicked (only the backdrop)', () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('img'));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog').className).toContain('animate-fade-in');
  });

  it('starts closing when the visible close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Закрити' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog').className).toContain('animate-fade-out');
  });

  it('swipes left to advance and right to go back past the threshold', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <ImageLightbox
        images={images}
        currentIndex={1}
        onClose={vi.fn()}
        onPrev={onPrev}
        onNext={onNext}
      />
    );
    const dialog = screen.getByRole('dialog');

    fireEvent.touchStart(dialog, { changedTouches: [{ screenX: 200 }] });
    fireEvent.touchEnd(dialog, { changedTouches: [{ screenX: 100 }] });
    expect(onNext).toHaveBeenCalledTimes(1);

    fireEvent.touchStart(dialog, { changedTouches: [{ screenX: 100 }] });
    fireEvent.touchEnd(dialog, { changedTouches: [{ screenX: 200 }] });
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('ignores a swipe shorter than the threshold', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <ImageLightbox
        images={images}
        currentIndex={1}
        onClose={vi.fn()}
        onPrev={onPrev}
        onNext={onNext}
      />
    );
    const dialog = screen.getByRole('dialog');

    fireEvent.touchStart(dialog, { changedTouches: [{ screenX: 100 }] });
    fireEvent.touchEnd(dialog, { changedTouches: [{ screenX: 110 }] });

    expect(onPrev).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('still closes when animationend never fires (reduced motion)', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <ImageLightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('zooms on double-click and disables swipe navigation while zoomed', () => {
    const onNext = vi.fn();
    render(
      <ImageLightbox
        images={images}
        currentIndex={1}
        onClose={vi.fn()}
        onPrev={vi.fn()}
        onNext={onNext}
      />
    );
    const img = screen.getByRole('img');

    fireEvent.pointerDown(img, { pointerId: 1, pointerType: 'mouse', button: 0 });
    fireEvent.pointerUp(img, { pointerId: 1, pointerType: 'mouse' });
    fireEvent.doubleClick(img);
    expect(img.style.transform).toContain('scale(2.5)');
    expect(screen.getByRole('button', { name: 'Наступне' }).className).toContain('hidden');

    const dialog = screen.getByRole('dialog');
    fireEvent.touchStart(dialog, { changedTouches: [{ screenX: 200 }] });
    fireEvent.touchEnd(dialog, { changedTouches: [{ screenX: 100 }] });
    expect(onNext).not.toHaveBeenCalled();

    fireEvent.doubleClick(img);
    expect(img.style.transform).toContain('scale(1)');
  });
});
