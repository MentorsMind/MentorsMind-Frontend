// CSV export utilities for admin analytics and earnings

import { tokenStorage } from './token.storage.utils';

/**
 * Parses the filename from a Content-Disposition header.
 * Handles both quoted (`filename="foo.csv"`) and unquoted (`filename=foo.csv`) forms.
 * Returns null if no filename is found.
 */
export function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;
  // Prefer quoted form first (RFC 6266 compliant), then fall back to unquoted
  const quoted = header.match(/filename="([^"]+)"/i);
  if (quoted) return quoted[1];
  const unquoted = header.match(/filename=([^;,\s]+)/i);
  if (unquoted) return unquoted[1];
  return null;
}

/**
 * Fetches a CSV file from `url` with an Authorization: Bearer header,
 * then triggers a browser download dialog via a temporary object URL.
 *
 * Uses fetch() (not window.location.href) so the auth header can be included.
 * The filename is extracted from the Content-Disposition response header when
 * available; `fallbackFilename` is used otherwise.
 */
export async function fetchAndDownloadCSV(
  url: string,
  fallbackFilename: string,
): Promise<void> {
  const token = tokenStorage.getAccessToken();

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 503) {
    throw new Error('Export is being prepared. Please try again in a few minutes.');
  }

  if (!response.ok) {
    throw new Error(`Export failed: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const filename =
    parseContentDispositionFilename(response.headers.get('content-disposition')) ??
    fallbackFilename;

  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

export const exportAnalyticsCSV = async (
  endpoint: string,
  period: string,
  filename: string
): Promise<void> => {
  const token = tokenStorage.getAccessToken();

  const response = await fetch(`${endpoint}?format=csv&period=${period}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 503) {
    throw new Error('Analytics data is being prepared. Please try again in a few minutes.');
  }

  if (!response.ok) {
    throw new Error('Failed to export CSV');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const downloadFilename =
    parseContentDispositionFilename(response.headers.get('content-disposition')) ?? filename;

  const link = document.createElement('a');
  link.href = url;
  link.download = downloadFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};