# Plan: Handle Mentor vs Wallet Earnings Different Response Shapes

## Information Gathered

- **Current `useEarnings` hook** calls `GET /mentors/:id/earnings` via `getEarnings()` returning `EarningsApiResponse` with `summary` and `sessions` arrays.
- **No wallet earnings API** exists yet. `useMentorWallet` only has mock data.
- **Chart component** (`EarningsChart`) has a weekly/monthly toggle and uses `ChartSeries[]` derived from sessions.
- **No date range picker** or `groupBy` (day/week/month) support exists in the earnings flow.
- **Type definitions** are in `src/types/earnings.types.ts`.
- **Service layer** is in `src/services/earnings.service.ts`.
- The **MentorWallet page** (`src/pages/MentorWallet.tsx`) currently only uses `useEarnings`.

## Issue Requirements

1. `GET /mentors/:id/earnings` returns numbers and a `breakdown` array (used for the chart).
2. `GET /wallets/me/earnings` returns string amounts, `currentPeriodEarnings`, `recentTransactions`, and `periodSummary`.
3. Mentor earnings dashboard **must use mentor endpoint as primary** (for chart breakdown).
4. Wallet earnings section **must use wallet endpoint** for current period summary and recent transactions.
5. All wallet amount strings **must be parsed with `parseFloat()`** before arithmetic or display.
6. Breakdown array `period` strings **must be parsed with `new Date()`** for chart x-axis labels.
7. `groupBy` query param accepts `"day"`, `"week"`, `"month"` — expose as a toggle in the chart header.
8. `from` and `to` date filters must be **ISO strings** — use a date range picker that outputs ISO format.

## Detailed Plan

### 1. Update Types (`src/types/earnings.types.ts`)

- Introduce `MentorEarningsBreakdownItem`:
  - `period: string` (date string)
  - `earnings: number`
  - `sessions: number`
- Introduce `MentorEarningsResponse`:
  - `totalEarnings: number`
  - `totalSessions: number`
  - `averagePerSession: number`
  - `breakdown: MentorEarningsBreakdownItem[]`
- Introduce `WalletEarningsTransaction`:
  - `id: string`
  - `type: string`
  - `amount: string`
  - `asset: string`
  - `date: string`
  - `description?: string`
- Introduce `WalletPeriodSummary`:
  - `startDate: string`
  - `endDate: string`
  - `sessionCount: number`
  - `averageEarning: string`
- Introduce `WalletEarningsResponse`:
  - `totalEarnings: string`
  - `currentPeriodEarnings: string`
  - `recentTransactions: WalletEarningsTransaction[]`
  - `periodSummary: WalletPeriodSummary`
- Introduce `GroupBy = 'day' | 'week' | 'month'`.
- Introduce `DateRangeFilter = { from: string; to: string }`.
- Update `ChartSeries` to use `period` (parsed date) for labels.

### 2. Update Services (`src/services/earnings.service.ts`)

- Update `getEarnings(mentorId, { groupBy?, from?, to? })` to accept query params and return `MentorEarningsResponse`.
- Add `getWalletEarnings({ from?, to? })` calling `GET /wallets/me/earnings` and returning `WalletEarningsResponse`.

### 3. Update `useEarnings` Hook (`src/hooks/useEarnings.ts`)

- Add state for `groupBy: GroupBy` (default `'month'`).
- Add state for `dateRange: DateRangeFilter` (default last 30 days as ISO strings).
- Fetch **both** `getEarnings(user.id, { groupBy, ...dateRange })` and `getWalletEarnings(dateRange)` in parallel.
- Store `mentorEarnings: MentorEarningsResponse | null`.
- Store `walletEarnings: WalletEarningsResponse | null`.
- Derive `chartSeries` from `mentorEarnings.breakdown`:
  - Parse each `period` with `new Date(period)`.
  - Format label based on `groupBy` (day, week, month).
- Derive `summary` from `mentorEarnings` totals (numbers).
- Derive `walletSummary` from `walletEarnings` with all amount strings run through `parseFloat()`.
- Keep existing session table data from mentor endpoint (`sessions` array) if still provided, or document change.
- Export new state setters: `setGroupBy`, `setDateRange`.

### 4. Update `EarningsChart` (`src/components/earnings/EarningsChart.tsx`)

- Replace weekly/monthly toggle with **day / week / month** toggle (`GroupBy`).
- Accept `groupBy: GroupBy` and `onGroupByChange` props.
- Update x-axis `dataKey` to `"period"` or `"label"` based on parsed date.
- Keep tooltip formatting unchanged.

### 5. Create `DateRangePicker` Earnings Wrapper

- Using existing `DatePicker` components or native `<input type="date">`.
- Output `from` and `to` as ISO strings (`YYYY-MM-DDTHH:mm:ss.sssZ` or `YYYY-MM-DD`).
- Pass into `useEarnings`.

### 6. Update `MentorWallet` Page (`src/pages/MentorWallet.tsx`)

- Consume new `useEarnings` return values.
- Pass `groupBy` / `onGroupByChange` to `EarningsChart`.
- Render date range picker above chart.
- Render a new **Wallet Earnings Section** below the chart:
  - Show `currentPeriodEarnings` (parseFloat).
  - Show `periodSummary` (parseFloat averageEarning).
  - Show `recentTransactions` list with parsed amounts.

### 7. Update Utilities (`src/utils/earnings.utils.ts`)

- Add `parseWalletAmount(value: string): number` helper using `parseFloat()`.
- Add `formatPeriodLabel(period: string, groupBy: GroupBy): string` helper using `new Date(period)`.
- Update `aggregateChartSeries` to support `groupBy: 'day' | 'week' | 'month'` using the `breakdown` array.

## Dependent Files to Edit

1. `src/types/earnings.types.ts`
2. `src/services/earnings.service.ts`
3. `src/hooks/useEarnings.ts`
4. `src/components/earnings/EarningsChart.tsx`
5. `src/components/earnings/EarningsSummary.tsx` (minor — ensure types align)
6. `src/pages/MentorWallet.tsx`
7. `src/utils/earnings.utils.ts`

## Follow-up Steps

1. Run TypeScript compiler (`tsc --noEmit`) to verify type safety.
2. Run linter (`npm run lint` or `pnpm lint`).
3. Run relevant tests (`vitest run src/__tests__` or similar).
4. Verify no import errors in `MentorWallet.tsx`.

