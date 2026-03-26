/**
 * Simple debounce function to limit how often a function can be called.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function calls to once per interval.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Highlights matches within a string based on a query.
 * Returns an array of parts with highlight flag.
 */
export function highlightMatch(
  text: string,
  query: string,
): { text: string; highlight: boolean }[] {
  if (!query.trim()) return [{ text, highlight: false }];

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return parts.map((part) => ({
    text: part,
    highlight: part.toLowerCase() === query.toLowerCase(),
  }));
}

/**
 * Simple search scoring logic.
 */
export function calculateMatchScore(text: string, query: string): number {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (normalizedText === normalizedQuery) return 100;
  if (normalizedText.startsWith(normalizedQuery)) return 80;
  if (normalizedText.includes(normalizedQuery)) return 50;

  return 0;
}

/**
 * Formats currency values consistently.
 */
export function formatCurrency(
  amount: number,
  currency: string = "XLM",
): string {
  return `${amount} ${currency}`;
}

// Common timezones for the filter
export const TIMEZONES = [
  { value: "UTC-12", label: "UTC-12:00" },
  { value: "UTC-11", label: "UTC-11:00" },
  { value: "UTC-10", label: "UTC-10:00" },
  { value: "UTC-9", label: "UTC-9:00" },
  { value: "UTC-8", label: "UTC-8:00 (PST)" },
  { value: "UTC-7", label: "UTC-7:00 (MST)" },
  { value: "UTC-6", label: "UTC-6:00 (CST)" },
  { value: "UTC-5", label: "UTC-5:00 (EST)" },
  { value: "UTC-4", label: "UTC-4:00 (AST)" },
  { value: "UTC-3", label: "UTC-3:00 (BRT)" },
  { value: "UTC-2", label: "UTC-2:00" },
  { value: "UTC-1", label: "UTC-1:00" },
  { value: "UTC+0", label: "UTC+0:00 (GMT)" },
  { value: "UTC+1", label: "UTC+1:00 (CET)" },
  { value: "UTC+2", label: "UTC+2:00 (EET)" },
  { value: "UTC+3", label: "UTC+3:00 (MSK)" },
  { value: "UTC+4", label: "UTC+4:00 (GST)" },
  { value: "UTC+5", label: "UTC+5:00 (PKT)" },
  { value: "UTC+6", label: "UTC+6:00 (BST)" },
  { value: "UTC+7", label: "UTC+7:00 (ICT)" },
  { value: "UTC+8", label: "UTC+8:00 (CST)" },
  { value: "UTC+9", label: "UTC+9:00 (JST)" },
  { value: "UTC+10", label: "UTC+10:00 (AEST)" },
  { value: "UTC+11", label: "UTC+11:00" },
  { value: "UTC+12", label: "UTC+12:00 (NZST)" },
];

// Available languages for filtering
export const AVAILABLE_LANGUAGES = [
  "English",
  "Spanish",
  "Mandarin",
  "Arabic",
  "French",
  "Portuguese",
  "Korean",
  "Japanese",
  "German",
  "Hindi",
];

// Available skills for filtering
export const AVAILABLE_SKILLS = [
  "Stellar",
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Rust",
  "Solidity",
  "Soroban",
  "Smart Contracts",
  "Web3",
  "DeFi",
  "NFTs",
  "Blockchain",
  "Figma",
  "Design Systems",
  "Cryptography",
  "Security Auditing",
];

/**
 * Check if mentor is available today based on timezone and availability
 */
export function isAvailableToday(availability: {
  days: string[];
  timezone?: string;
}): boolean {
  const today = new Date();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = dayNames[today.getDay()];
  return availability.days.includes(todayName);
}

/**
 * Check if mentor is available this week
 */
export function isAvailableThisWeek(availability: { days: string[] }): boolean {
  return availability.days.length > 0;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
