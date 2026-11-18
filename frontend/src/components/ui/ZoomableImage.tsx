import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;

interface Transform {
  scale: number;
  x: number;
  y: number;
}

export interface ZoomableImageHandle {
  /** Zoom in around the centre, or reset if already zoomed (used by the mobile magnifier button). */
  toggleZoom: () => void;
}

interface ZoomableImageProps {
  ref?: Ref<ZoomableImageHandle>;
  src: string;
  alt: string;
  /** Reports whether the image is zoomed in, so the parent can disable swipe navigation. */
  onZoomChange: (zoomed: boolean) => void;
  /** Called on a click/tap on the empty area around the image while not zoomed. */
  onBackdropClick: () => void;
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Image with click-to-zoom (mouse), pinch / double-tap zoom (touch), wheel zoom and drag-to-pan.
 * Built on pointer events so it works the same for touch, pen and mouse.
 *
 * Clicks are classified in pointerup, not onClick: pointer capture retargets `click` to the
 * wrapper, which made a click on the photo look like a click on the backdrop and close the viewer.
 */
export default function ZoomableImage({
  ref,
  src,
  alt,
  onZoomChange,
  onBackdropClick,
  className = '',
}: ZoomableImageProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [t, setTState] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);

  // Mirror of `t` for event handlers; written together with the state so it's never stale
  const tRef = useRef(t);
  const setT = useCallback((next: Transform) => {
    tRef.current = next;
    setTState(next);
  }, []);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    start: Transform;
    mid: { x: number; y: number };
    dist: number;
  } | null>(null);
  const moved = useRef(false);
  const lastTap = useRef(0);
  // Whether the current press started on the photo itself (vs the empty area around it)
  const downOnImage = useRef(false);

  const zoomed = t.scale > 1.01;
  useEffect(() => onZoomChange(zoomed), [zoomed, onZoomChange]);

  /** Point relative to the centre of the zoom area (the transform origin). */
  const toLocal = useCallback((clientX: number, clientY: number) => {
    const r = areaRef.current!.getBoundingClientRect();
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  }, []);

  /** Keep the image from being dragged off screen. */
  const bound = useCallback((next: Transform): Transform => {
    const img = imgRef.current;
    const area = areaRef.current;
    if (!img || !area || next.scale <= 1) return { scale: Math.max(next.scale, 1), x: 0, y: 0 };
    const maxX = Math.max(0, (img.offsetWidth * next.scale - area.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight * next.scale - area.clientHeight) / 2);
    return { scale: next.scale, x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
  }, []);

  /** Zoom to `scale` keeping the image point under `focus` (local coords) in place. */
  const zoomAt = useCallback(
    (from: Transform, scale: number, focus: { x: number; y: number }, to = focus) => {
      const s = clamp(scale, MIN_SCALE, MAX_SCALE);
      const ratio = s / from.scale;
      return bound({
        scale: s,
        x: to.x - (focus.x - from.x) * ratio,
        y: to.y - (focus.y - from.y) * ratio,
      });
    },
    [bound]
  );

  const beginGesture = () => {
    const pts = [...pointers.current.values()];
    if (pts.length === 0) {
      gesture.current = null;
      return;
    }
    const mid =
      pts.length > 1
        ? toLocal((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2)
        : toLocal(pts[0].x, pts[0].y);
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { start: tRef.current, mid, dist };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      moved.current = false;
      downOnImage.current = e.target === imgRef.current;
    }
    setAnimate(false);
    beginGesture();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];

    if (pts.length > 1) {
      moved.current = true;
      const mid = toLocal((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      setT(zoomAt(g.start, g.start.scale * (dist / g.dist), g.mid, mid));
    } else if (g.start.scale > 1) {
      const p = toLocal(pts[0].x, pts[0].y);
      const dx = p.x - g.mid.x;
      const dy = p.y - g.mid.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved.current = true;
      setT(bound({ scale: g.start.scale, x: g.start.x + dx, y: g.start.y + dy }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    // Re-anchor so lifting one finger of a pinch continues as a pan without a jump
    beginGesture();

    if (e.type === 'pointercancel' || pointers.current.size > 0 || moved.current) return;

    // A press without movement: decide what it was
    if (!downOnImage.current) {
      if (tRef.current.scale <= 1.01) onBackdropClick();
      return;
    }
    if (e.pointerType === 'mouse') {
      toggleZoom(toLocal(e.clientX, e.clientY));
      return;
    }
    // Touch: single tap does nothing (zoom is via the magnifier button, double tap or pinch)
    const now = e.timeStamp;
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      toggleZoom(toLocal(e.clientX, e.clientY));
    } else {
      lastTap.current = now;
    }
  };

  /** Zoom in to DOUBLE_TAP_SCALE around `focus` (local coords, default centre), or reset. */
  const toggleZoom = (focus = { x: 0, y: 0 }) => {
    setAnimate(true);
    const cur = tRef.current;
    setT(cur.scale > 1.01 ? { scale: 1, x: 0, y: 0 } : zoomAt(cur, DOUBLE_TAP_SCALE, focus));
  };

  useImperativeHandle(ref, () => ({ toggleZoom: () => toggleZoom() }));

  // Wheel needs a non-passive listener to stop the page from scrolling
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setAnimate(false);
      const cur = tRef.current;
      setT(zoomAt(cur, cur.scale * Math.exp(-e.deltaY * 0.002), toLocal(e.clientX, e.clientY)));
    };
    area.addEventListener('wheel', onWheel, { passive: false });
    return () => area.removeEventListener('wheel', onWheel);
  }, [zoomAt, toLocal, setT]);

  return (
    <div
      ref={areaRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        style={{
          transform: `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.scale})`,
          transition: animate ? 'transform 250ms ease-out' : 'none',
        }}
        className={`max-w-full max-h-full object-contain will-change-transform ${
          zoomed ? 'cursor-zoom-out active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
      />
    </div>
  );
}
