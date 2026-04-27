// ---------------------------------------------------------------------------
// deriveDeviceName
// ---------------------------------------------------------------------------

/**
 * Parses a user-agent string into a human-readable device label.
 *
 * Detection order matters — Edge must be checked before Chrome because Edge
 * user-agents contain both "Edg" and "Chrome". Similarly, Chrome must be
 * checked before Safari because Safari user-agents contain "Safari" too.
 *
 * @example
 * deriveDeviceName(navigator.userAgent) // "Chrome on macOS"
 */
export function deriveDeviceName(userAgent: string): string {
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  return `${browser} on ${os}`;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function detectBrowser(ua: string): string {
  // Edge must come before Chrome (Edge UA contains "Chrome")
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  // Chrome must come before Safari (Safari UA contains "Safari")
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Unknown Browser';
}

function detectOS(ua: string): string {
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows';
  // macOS must come after iOS (iOS UA contains "Mac OS X" too)
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown OS';
}
