import type { MentorPayoutSession, ChartSeries, ChartRange, SortKey } from '../types/earnings.types';

// ---------------------------------------------------------------------------
// ISO week helpers
// ---------------------------------------------------------------------------

/** Returns the ISO week number (1–53) for a given Date. */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Returns the ISO week year (may differ from calendar year near year boundaries). */
function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}

/** Formats a week key "W{week} {year}" e.g. "W12 2025". */
function formatWeekLabel(week: number, year: number): string {
  return `W${week} ${year}`;
}

/** Formats a month key as "MMM 'YY" e.g. "Mar '25". */
function formatMonthLabel(year: number, month: number): string {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${MONTHS[month]} '${String(year).slice(-2)}`;
}

// ---------------------------------------------------------------------------
// aggregateChartSeries
// ---------------------------------------------------------------------------

/**
 * Groups sessions by ISO week (range='weekly') or calendar month (range='monthly').
 * Returns exactly 12 data points covering the 12 most recent periods, ordered
 * oldest to newest. Periods with no sessions get netPayout: 0.
 */
export function aggregateChartSeries(
  sessions: MentorPayoutSession[],
  range: ChartRange,
): ChartSeries[] {
  const now = new Date();

  if (range === 'weekly') {
    // Build a map of "week-year" -> total netPayout
    const totals = new Map<string, number>();
    for (const s of sessions) {
      const d = new Date(s.sessionDate);
      const week = getISOWeek(d);
      const year = getISOWeekYear(d);
      const key = `${year}-W${String(week).padStart(2, '0')}`;
      totals.set(key, (totals.get(key) ?? 0) + s.netPayout);
    }

    // Generate the 12 most recent ISO weeks ending at the current week
    const result: ChartSeries[] = [];
    const cursor = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    // Align cursor to Monday of the current ISO week
    cursor.setUTCDate(cursor.getUTCDate() - ((cursor.getUTCDay() || 7) - 1));

    for (let i = 11; i >= 0; i--) {
      const weekDate = new Date(cursor);
      weekDate.setUTCDate(cursor.getUTCDate() - i * 7);
      const week = getISOWeek(weekDate);
      const year = getISOWeekYear(weekDate);
      const key = `${year}-W${String(week).padStart(2, '0')}`;
      result.push({
        label: formatWeekLabel(week, year),
        netPayout: totals.get(key) ?? 0,
      });
    }

    return result;
  } else {
    // Monthly
    const totals = new Map<string, number>();
    for (const s of sessions) {
      const d = new Date(s.sessionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      totals.set(key, (totals.get(key) ?? 0) + s.netPayout);
    }

    // Generate the 12 most recent calendar months ending at the current month
    const result: ChartSeries[] = [];
    for (let i = 11; i >= 0; i--) {
      const year = now.getFullYear();
      const month = now.getMonth() - i; // may be negative; Date handles rollover
      const d = new Date(year, month, 1);
      const y = d.getFullYear();
      const m = d.getMonth(); // 0-indexed
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      result.push({
        label: formatMonthLabel(y, m),
        netPayout: totals.get(key) ?? 0,
      });
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// getMajorityCurrency
// ---------------------------------------------------------------------------

/**
 * Returns the asset code whose sessions sum to the highest total netPayout.
 * Returns 'USDC' as default if sessions is empty.
 */
export function getMajorityCurrency(sessions: MentorPayoutSession[]): string {
  if (sessions.length === 0) return 'USDC';

  const totals = new Map<string, number>();
  for (const s of sessions) {
    totals.set(s.asset, (totals.get(s.asset) ?? 0) + s.netPayout);
  }

  let topAsset = 'USDC';
  let topTotal = -Infinity;
  for (const [asset, total] of totals) {
    if (total > topTotal) {
      topTotal = total;
      topAsset = asset;
    }
  }

  return topAsset;
}

// ---------------------------------------------------------------------------
// formatAmount
// ---------------------------------------------------------------------------

/**
 * Returns e.g. "114.00 USDC" (2 decimal places + space + asset code).
 */
export function formatAmount(amount: number, asset: string): string {
  return `${amount.toFixed(2)} ${asset}`;
}

// ---------------------------------------------------------------------------
// truncateTxHash
// ---------------------------------------------------------------------------

/**
 * Returns hash.slice(0, 8) + "…" + hash.slice(-4).
 */
export function truncateTxHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// buildStellarUrl
// ---------------------------------------------------------------------------

/**
 * Returns the Stellar Expert explorer URL for a given transaction hash.
 */
export function buildStellarUrl(txHash: string): string {
  return `https://stellar.expert/explorer/public/tx/${txHash}`;
}

// ---------------------------------------------------------------------------
// sortSessions
// ---------------------------------------------------------------------------

/**
 * Returns a new sorted array (does not mutate input).
 * Sorts by sessionDate (string comparison), grossAmount (numeric), or netPayout (numeric).
 */
export function sortSessions(
  sessions: MentorPayoutSession[],
  key: SortKey,
  dir: 'asc' | 'desc',
): MentorPayoutSession[] {
  const copy = [...sessions];
  copy.sort((a, b) => {
    let cmp: number;
    if (key === 'sessionDate') {
      cmp = a.sessionDate < b.sessionDate ? -1 : a.sessionDate > b.sessionDate ? 1 : 0;
    } else {
      cmp = a[key] - b[key];
    }
    return dir === 'asc' ? cmp : -cmp;
  });
  return copy;
}
