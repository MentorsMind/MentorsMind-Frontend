export const PERFORMANCE_BUDGETS = {
  maxInitialJsKb: 250,
  maxChunkKb: 350,
  maxImageKb: 200,
};

export const shouldUseVirtualization = (count: number, threshold = 8) => count > threshold;

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const buildWebpSource = (src?: string) => {
  if (!src) return undefined;
  if (!/\.(png|jpg|jpeg)$/i.test(src)) return undefined;
  return src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
};

export const preloadResource = (href: string, as: string, type?: string) => {
  const doc = (globalThis as any).document as any;
  if (!doc?.head) return;
  if (doc.head.querySelector?.(`link[rel="preload"][href="${href}"]`)) return;

  const link = doc.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) {
    link.type = type;
  }
  doc.head.appendChild(link);
};

export const preloadCriticalResources = () => {
  preloadResource('/vite.svg', 'image', 'image/svg+xml');
  const doc = (globalThis as any).document as any;
  if (doc?.head && !doc.head.querySelector?.('link[rel="preconnect"][href="https://api.dicebear.com"]')) {
    const preconnect = doc.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://api.dicebear.com';
    doc.head.appendChild(preconnect);
  }
};

export const registerServiceWorker = () => {
  const win = (globalThis as any).window as any;
  const nav = (globalThis as any).navigator as any;
  if (!win?.addEventListener || !nav?.serviceWorker?.register) return;
  win.addEventListener('load', () => {
    nav.serviceWorker.register('/sw.js').catch(() => {
      // Ignore service worker registration failures in unsupported environments.
    });
  });
};
