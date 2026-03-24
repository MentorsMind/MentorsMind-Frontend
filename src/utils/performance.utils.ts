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
  if (typeof document === 'undefined') return;
  if (document.head.querySelector(`link[rel="preload"][href="${href}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) {
    link.type = type;
  }
  document.head.appendChild(link);
};

export const preloadCriticalResources = () => {
  preloadResource('/vite.svg', 'image', 'image/svg+xml');
  if (typeof document !== 'undefined' && !document.head.querySelector('link[rel="preconnect"][href="https://api.dicebear.com"]')) {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://api.dicebear.com';
    document.head.appendChild(preconnect);
  }
};

export const registerServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore service worker registration failures in unsupported environments.
    });
  });
};
