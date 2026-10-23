interface PreloadItem {
  src: string;
  srcSet?: string;
  sizes?: string;
}

const PER_IMAGE_TIMEOUT_MS = 10_000;
const queue: PreloadItem[] = [];
const seen = new Set<string>();
let running = false;

function preloadOne(item: PreloadItem): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => {
      window.clearTimeout(timer);
      img.onload = img.onerror = null;
      resolve();
    };
    const timer = window.setTimeout(done, PER_IMAGE_TIMEOUT_MS);
    img.onload = done;
    img.onerror = done;
    if (item.sizes) img.sizes = item.sizes;
    if (item.srcSet) img.srcset = item.srcSet;
    img.src = item.src;
  });
}

async function run() {
  if (running) return;
  running = true;
  while (queue.length > 0) {
    await preloadOne(queue.shift()!);
  }
  running = false;
}

/**
 * Queues an image to be downloaded in the background, one at a time, once the page
 * has finished loading. Images scrolled into view meanwhile load natively; the queue
 * just warms the cache so the rest are already there when the user reaches them.
 */
export function enqueueImagePreload(item: PreloadItem): void {
  const key = item.srcSet ?? item.src;
  if (seen.has(key)) return;
  seen.add(key);
  queue.push(item);

  if (document.readyState === 'complete') {
    void run();
  } else {
    window.addEventListener('load', () => void run(), { once: true });
  }
}
