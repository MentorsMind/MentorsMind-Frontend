# Implementation Plan: Mentor Earnings & Payout Dashboard

## Overview

Replace the placeholder `MentorWallet` page with a fully functional earnings dashboard. The implementation follows a bottom-up approach: types → service → hook → leaf components → composed page. Each step integrates immediately so there is no orphaned code.

## Tasks

- [x] 1. Define TypeScript types and install property-based testing library
  - Create `src/types/earnings.types.ts` with `PayoutStatus`, `SortKey`, `ChartRange`, `EarningsSummaryData`, `MentorPayoutSession`, `ChartSeries`, `EarningsApiResponse`, and `RawPayoutSession`
  - Run `npm install -D fast-check` to add the PBT library
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 5.1_

- [x] 2. Implement the earnings service
  - [x] 2.1 Create `src/services/earnings.service.ts` with `getEarnings(mentorId: string): Promise<EarningsApiResponse>` calling `GET /mentors/:id/earnings` via the existing `api` client
    - _Requirements: 1.2_

  - [ ]* 2.2 Write unit test: `earningsService.getEarnings` is called with the authenticated mentor's ID on mount
    - _Requirements: 1.2_

- [x] 3. Implement pure utility functions (aggregation, formatting, sorting)
  - [x] 3.1 Create `src/utils/earnings.utils.ts` with:
    - `aggregateChartSeries(sessions, range): ChartSeries[]` — groups sessions by ISO week or calendar month, returns exactly 12 data points, fills missing periods with `netPayout: 0`
    - `getMajorityCurrency(sessions): string` — returns the asset code with the highest summed `netPayout`
    - `formatAmount(amount: number, asset: string): string` — returns `"114.00 USDC"` style strings
    - `truncateTxHash(hash: string): string` — returns `hash.slice(0, 8) + "…" + hash.slice(-4)`
    - `buildStellarUrl(txHash: string): string` — returns `https://stellar.expert/explorer/public/tx/${txHash}`
    - `sortSessions(sessions, key, dir): MentorPayoutSession[]` — sorts by `sessionDate`, `grossAmount`, or `netPayout`
    - _Requirements: 2.3, 2.4, 2.6, 2.7, 3.4, 3.5, 5.1, 5.3_

  - [ ]* 3.2 Write property test for chart aggregation (P2)
    - **Property 2: Chart aggregation always produces 12 data points**
    - **Validates: Requirements 2.3, 2.4, 2.7**
    - File: `src/__tests__/chartAggregation.pbt.test.ts`
    - `// Feature: mentor-earnings-payout-dashboard, Property 2: Chart aggregation always produces 12 data points`

  - [ ]* 3.3 Write property test for majority-currency label (P3)
    - **Property 3: Majority-currency y-axis label**
    - **Validates: Requirements 2.6**
    - File: `src/__tests__/chartAggregation.pbt.test.ts`
    - `// Feature: mentor-earnings-payout-dashboard, Property 3: Majority-currency y-axis label`

  - [ ]* 3.4 Write property test for amount formatting (P7)
    - **Property 7: Amount formatting includes asset code**
    - **Validates: Requirements 3.5**
    - File: `src/__tests__/formatAmount.pbt.test.ts`
    - `// Feature: mentor-earnings-payout-dashboard, Property 7: Amount formatting includes asset code`

  - [ ]* 3.5 Write property test for sort correctness and round-trip (P6)
    - **Property 6: Sort produces a correctly ordered sequence and is reversible**
    - **Validates: Requirements 3.4**
    - File: `src/__tests__/sessionSort.pbt.test.ts`
    - `// Feature: mentor-earnings-payout-dashboard, Property 6: Sort produces a correctly ordered sequence and is reversible`

  - [ ]* 3.6 Write property test for transaction hash truncation (P10)
    - **Property 10: Transaction hash truncation**
    - **Validates: Requirements 5.1**
    - File: `src/__tests__/StellarTxLink.pbt.test.tsx`
    - `// Feature: mentor-earnings-payout-dashboard, Property 10: Transaction hash truncation`

  - [ ]* 3.7 Write property test for Stellar URL construction (P11)
    - **Property 11: Stellar Explorer URL construction**
    - **Validates: Requirements 5.3**
    - File: `src/__tests__/StellarTxLink.pbt.test.tsx`
    - `// Feature: mentor-earnings-payout-dashboard, Property 11: Stellar Explorer URL construction`

- [x] 4. Checkpoint — Ensure all utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement `useEarnings` hook
  - [x] 5.1 Create `src/hooks/useEarnings.ts` implementing the full `UseEarningsReturn` interface:
    - Calls `earningsService.getEarnings` on mount using the authenticated mentor's ID
    - Stores last successful response in a `useRef` for optimistic cache (shows stale data immediately on re-mount while background refresh runs)
    - Derives `summary`, `chartSeries` (via `aggregateChartSeries`), and sorted/paginated `sessions` from raw API data
    - Exposes `loading`, `error`, `retry`, `chartRange`, `setChartRange`, `page`, `setPage`, `sortKey`, `sortDir`, `setSort`, `exportCSV`
    - `setPage` clamps to valid range `[1, Math.ceil(totalSessions / 20)]`
    - `exportCSV` calls the existing `exportToCSV` utility with all sorted sessions and filename `mentor-earnings-{YYYY-MM-DD}.csv`
    - _Requirements: 1.2, 1.3, 1.6, 2.3, 2.4, 3.3, 3.4, 7.2, 7.4_

  - [ ]* 5.2 Write property test for summary values matching API data (P1)
    - **Property 1: Summary values match API data**
    - **Validates: Requirements 1.3**
    - File: `src/__tests__/useEarnings.pbt.test.ts`
    - `// Feature: mentor-earnings-payout-dashboard, Property 1: Summary values match API data`

  - [ ]* 5.3 Write property test for empty-to-populated state transition (P13)
    - **Property 13: Empty-to-populated state transition**
    - **Validates: Requirements 6.5**
    - File: `src/__tests__/useEarnings.pbt.test.ts`
    - `// Feature: mentor-earnings-payout-dashboard, Property 13: Empty-to-populated state transition`

- [x] 6. Implement leaf components
  - [x] 6.1 Create `src/components/earnings/PayoutStatusChip.tsx`
    - Renders a badge with label `"Paid"` (green), `"Pending"` (yellow), or `"Failed"` (red) based on `status: PayoutStatus`
    - For `pending` status: wraps in a tooltip showing `estimatedReleaseDate` formatted as a human-readable date, or `"Release date pending session confirmation"` if absent
    - _Requirements: 3.6, 3.7, 3.8, 4.1, 4.3_

  - [ ]* 6.2 Write property test for PayoutStatusChip label and colour (P8)
    - **Property 8: PayoutStatusChip label matches payout status**
    - **Validates: Requirements 3.6, 3.7, 3.8**
    - File: `src/__tests__/PayoutStatusChip.pbt.test.tsx`
    - `// Feature: mentor-earnings-payout-dashboard, Property 8: PayoutStatusChip label matches payout status`

  - [ ]* 6.3 Write property test for pending chip tooltip content (P9)
    - **Property 9: Pending chip tooltip shows release date or fallback**
    - **Validates: Requirements 4.3**
    - File: `src/__tests__/PayoutStatusChip.pbt.test.tsx`
    - `// Feature: mentor-earnings-payout-dashboard, Property 9: Pending chip tooltip shows release date or fallback`

  - [x] 6.4 Create `src/components/earnings/StellarTxLink.tsx`
    - Accepts `txHash: string | null | undefined`
    - When `txHash` is present: renders a truncated link (`truncateTxHash`) opening `buildStellarUrl(txHash)` in a new tab with `rel="noopener noreferrer"` and `target="_blank"`
    - When `txHash` is absent: renders `"—"`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 6.5 Write property test for link security attributes (P12)
    - **Property 12: Transaction hash link security attributes**
    - **Validates: Requirements 5.5**
    - File: `src/__tests__/StellarTxLink.pbt.test.tsx`
    - `// Feature: mentor-earnings-payout-dashboard, Property 12: Transaction hash link security attributes`

  - [x] 6.6 Create `src/components/earnings/EmptyState.tsx`
    - Renders an icon, heading `"No earnings yet"`, descriptive paragraph about Stellar payouts, and a CTA link to `/mentor/sessions`
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. Implement composite components
  - [x] 7.1 Create `src/components/earnings/EarningsSummary.tsx`
    - Accepts `summary: EarningsSummaryData | null` and `loading: boolean`
    - Renders three `MetricCard` instances: "Total Earned (All Time)", "Pending Payouts" (with secondary label "Held in escrow — releases after session completion"), "This Month's Earnings"
    - Shows skeleton cards when `loading` is true or `summary` is null
    - _Requirements: 1.1, 1.3, 1.4, 4.2, 6.4_

  - [x] 7.2 Create `src/components/earnings/EarningsChart.tsx`
    - Wraps Recharts `BarChart` with `series: ChartSeries[]`, `range: ChartRange`, `onRangeChange`
    - Renders Weekly / Monthly toggle buttons
    - Y-axis label uses `getMajorityCurrency(sessions)` result passed as a prop
    - Tooltip shows time period label and net earnings value on hover/focus
    - Zero-value bars are rendered (not omitted)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 7.3 Create `src/components/earnings/SessionTable.tsx`
    - Paginated table (20 rows/page) with columns: Date, Mentee Name, Duration (min), Gross Amount, Platform Fee, Net Payout, Payout Status, Transaction Hash
    - Sortable column headers for Date, Gross Amount, Net Payout (toggle asc/desc on repeated click)
    - Renders `PayoutStatusChip` and `StellarTxLink` per row
    - "Export CSV" button: disabled with `title="No data to export"` when sessions is empty, otherwise calls `onExport`
    - Amounts formatted via `formatAmount`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.5_

  - [ ]* 7.4 Write property test for all sessions appearing in table with all fields (P4)
    - **Property 4: All sessions appear in the table with all required fields**
    - **Validates: Requirements 3.1, 3.2**
    - File: `src/__tests__/SessionTable.pbt.test.tsx`
    - `// Feature: mentor-earnings-payout-dashboard, Property 4: All sessions appear in the table with all required fields`

  - [ ]* 7.5 Write property test for pagination max 20 rows (P5)
    - **Property 5: Pagination shows at most 20 rows per page**
    - **Validates: Requirements 3.3**
    - File: `src/__tests__/SessionTable.pbt.test.tsx`
    - `// Feature: mentor-earnings-payout-dashboard, Property 5: Pagination shows at most 20 rows per page`

  - [ ]* 7.6 Write property test for CSV export content (P14)
    - **Property 14: CSV export content matches session data**
    - **Validates: Requirements 7.2, 7.3**
    - File: `src/__tests__/csvExport.pbt.test.ts`
    - `// Feature: mentor-earnings-payout-dashboard, Property 14: CSV export content matches session data`

  - [ ]* 7.7 Write property test for CSV filename date (P15)
    - **Property 15: CSV filename includes current date**
    - **Validates: Requirements 7.4**
    - File: `src/__tests__/csvExport.pbt.test.ts`
    - `// Feature: mentor-earnings-payout-dashboard, Property 15: CSV filename includes current date`

- [x] 8. Checkpoint — Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Replace `MentorWallet` page and wire everything together
  - [x] 9.1 Replace `src/pages/MentorWallet.tsx` wholesale:
    - Call `useEarnings` to get all state and handlers
    - Render error banner with "Retry" button when `error` is set
    - Render `EarningsSummary` (always visible, shows zeros in empty state)
    - When `sessions.length === 0` and not loading: render `EmptyState` in place of chart and table
    - Otherwise: render `EarningsChart` and `SessionTable`
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 6.1, 6.4, 6.5_

  - [ ]* 9.2 Write unit tests in `src/__tests__/MentorEarningsDashboard.test.tsx` covering:
    - EarningsSummary renders all three card titles (Req 1.1)
    - Skeleton cards shown while loading (Req 1.4)
    - Error banner with retry button shown on API failure (Req 1.5)
    - EarningsChart renders a bar chart element (Req 2.1)
    - Weekly and Monthly toggle options are present (Req 2.2)
    - "Held in escrow — releases after session completion" label present (Req 4.2)
    - Transaction hash link opens in a new tab (Req 5.2)
    - Dash rendered when txHash absent on completed session (Req 5.4)
    - EmptyState shown and table/chart hidden when sessions is empty (Req 6.1)
    - EmptyState heading "No earnings yet" present (Req 6.2)
    - EmptyState CTA link points to `/mentor/sessions` (Req 6.3)
    - Summary cards show zero values in empty state (Req 6.4)
    - "Export CSV" button is rendered (Req 7.1)
    - "Export CSV" button is disabled when sessions is empty (Req 7.5)

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations each
- Each property test is tagged with `// Feature: mentor-earnings-payout-dashboard, Property N: ...`
- The optimistic cache in `useEarnings` (via `useRef`) satisfies Requirement 1.6 without a separate caching layer
