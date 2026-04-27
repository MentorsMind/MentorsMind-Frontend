# Requirements Document

## Introduction

The Mentor Earnings & Payout Dashboard gives mentors a dedicated UI to understand their income and track payout status. The backend already tracks `mentor_payout` per booking and exposes a `GET /mentors/:id/earnings` analytics endpoint. This feature surfaces that data through summary cards, a time-series earnings chart, a per-session breakdown table, and Stellar transaction links — replacing the current placeholder wallet page with a fully functional earnings experience.

## Glossary

- **Dashboard**: The Mentor Earnings & Payout Dashboard page rendered at the mentor's wallet/earnings route.
- **Earnings_Service**: The frontend service layer that calls `GET /mentors/:id/earnings` and related API endpoints.
- **Earnings_Summary**: The set of metric cards at the top of the Dashboard showing aggregate figures.
- **Earnings_Chart**: The bar chart component visualising earnings over time with a week/month toggle.
- **Session_Table**: The paginated table listing per-session earning details.
- **Payout_Status_Chip**: The inline badge component indicating the payout state of a session (pending, completed, failed).
- **Stellar_Explorer**: The external Stellar blockchain explorer (e.g. stellar.expert) used to verify on-chain transactions.
- **Escrow**: The smart-contract-based holding mechanism that retains funds until a session is confirmed complete.
- **Platform_Fee**: The percentage of gross session earnings deducted by the platform before releasing net payout to the mentor.
- **Mentor**: An authenticated user with the `mentor` role.
- **Empty_State**: The zero-data view shown to mentors who have no completed sessions or earnings yet.

---

## Requirements

### Requirement 1: Earnings Summary Cards

**User Story:** As a mentor, I want to see a summary of my earnings at a glance, so that I can quickly understand my total income, pending funds, and this month's performance.

#### Acceptance Criteria

1. THE Dashboard SHALL display an Earnings_Summary section containing three metric cards: "Total Earned (All Time)", "Pending Payouts", and "This Month's Earnings".
2. WHEN the Dashboard loads, THE Earnings_Service SHALL fetch earnings data from `GET /mentors/:id/earnings` using the authenticated mentor's ID.
3. WHEN earnings data is successfully retrieved, THE Earnings_Summary SHALL display the total all-time net payout, the total amount currently held in Escrow, and the net earnings for the current calendar month.
4. WHILE earnings data is loading, THE Earnings_Summary SHALL display skeleton placeholder cards in place of metric values.
5. IF the `GET /mentors/:id/earnings` request fails, THEN THE Dashboard SHALL display an inline error message with a retry action.
6. THE Earnings_Summary SHALL update its displayed values without a full page reload when the mentor navigates back to the Dashboard within the same session.

---

### Requirement 2: Earnings Chart with Time Range Toggle

**User Story:** As a mentor, I want to visualise my earnings over time with a toggleable time range, so that I can identify trends in my income by week or month.

#### Acceptance Criteria

1. THE Dashboard SHALL display an Earnings_Chart rendered as a bar chart showing net earnings grouped by time period.
2. THE Earnings_Chart SHALL provide a toggle control with at least two options: "Weekly" and "Monthly".
3. WHEN the mentor selects "Weekly", THE Earnings_Chart SHALL re-render with earnings aggregated by ISO week, showing the most recent 12 weeks.
4. WHEN the mentor selects "Monthly", THE Earnings_Chart SHALL re-render with earnings aggregated by calendar month, showing the most recent 12 months.
5. WHEN a bar is hovered or focused, THE Earnings_Chart SHALL display a tooltip showing the time period label and the net earnings value for that period.
6. THE Earnings_Chart SHALL label the y-axis with the asset currency code (e.g. USDC or XLM) of the majority of the mentor's earnings.
7. IF no earnings exist for a given time period, THE Earnings_Chart SHALL render that period's bar with a zero value rather than omitting the period.

---

### Requirement 3: Per-Session Breakdown Table

**User Story:** As a mentor, I want a detailed table of every session's earnings, so that I can audit exactly what I was paid, what fees were deducted, and the status of each payout.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Session_Table listing all sessions for which a `mentor_payout` record exists.
2. THE Session_Table SHALL include the following columns for each row: session date, mentee name, session duration in minutes, gross amount, Platform_Fee deducted, net payout amount, and a Payout_Status_Chip.
3. THE Session_Table SHALL support pagination or infinite scroll, loading a maximum of 20 rows per page.
4. WHEN the mentor clicks a column header for "Date", "Gross Amount", or "Net Payout", THE Session_Table SHALL sort rows by that column in ascending order on first click and descending order on second click.
5. THE Session_Table SHALL display amounts with their asset currency code (e.g. "114.00 USDC").
6. WHEN a session's payout status is "completed", THE Session_Table SHALL display a Payout_Status_Chip with a green visual style and the label "Paid".
7. WHEN a session's payout status is "pending", THE Session_Table SHALL display a Payout_Status_Chip with a yellow visual style and the label "Pending".
8. WHEN a session's payout status is "failed", THE Session_Table SHALL display a Payout_Status_Chip with a red visual style and the label "Failed".

---

### Requirement 4: Pending Payout Explanation

**User Story:** As a mentor, I want pending payouts to be clearly explained, so that I understand why funds are held and when they will be released.

#### Acceptance Criteria

1. WHEN a session row in the Session_Table has a payout status of "pending", THE Dashboard SHALL display an inline informational tooltip or banner explaining that funds are held in Escrow and will be released after session completion is confirmed.
2. THE Earnings_Summary "Pending Payouts" card SHALL include a secondary label reading "Held in escrow — releases after session completion".
3. WHEN the mentor hovers or focuses the Payout_Status_Chip for a pending session, THE Dashboard SHALL display a tooltip with the estimated release date if available, or the message "Release date pending session confirmation".

---

### Requirement 5: Stellar Transaction Hash Display

**User Story:** As a mentor, I want to see the Stellar transaction hash for each completed payout and be able to verify it on the blockchain explorer, so that I have transparent proof of payment.

#### Acceptance Criteria

1. WHEN a session's payout status is "completed" and a Stellar transaction hash is available, THE Session_Table SHALL display the transaction hash in a truncated format (first 8 and last 4 characters separated by "…") within the session row.
2. WHEN the mentor clicks a displayed transaction hash, THE Dashboard SHALL open the corresponding Stellar_Explorer URL in a new browser tab.
3. THE Stellar_Explorer URL SHALL be constructed as `https://stellar.expert/explorer/public/tx/{txHash}`.
4. WHEN a session's payout status is "completed" but no transaction hash is available, THE Session_Table SHALL display a dash ("—") in the transaction hash column.
5. THE Session_Table transaction hash link SHALL include `rel="noopener noreferrer"` to prevent tab-napping security vulnerabilities.

---

### Requirement 6: Empty State for New Mentors

**User Story:** As a new mentor with no sessions, I want to see a helpful empty state, so that I understand how the payout system works before I have any earnings.

#### Acceptance Criteria

1. WHEN the authenticated mentor has zero completed sessions and zero earnings records, THE Dashboard SHALL display an Empty_State view in place of the Session_Table and Earnings_Chart.
2. THE Empty_State SHALL include an illustrative icon or graphic, a heading of "No earnings yet", and a descriptive paragraph explaining that payouts are processed via Stellar after each session is completed and confirmed.
3. THE Empty_State SHALL include a call-to-action link or button directing the mentor to their session scheduling or profile page.
4. THE Earnings_Summary cards SHALL still be visible in the Empty_State view, displaying zero values.
5. WHEN the mentor completes their first session and the Dashboard data refreshes, THE Empty_State SHALL be replaced by the populated Session_Table and Earnings_Chart without requiring a manual page reload.

---

### Requirement 7: Data Export

**User Story:** As a mentor, I want to export my earnings data as a CSV file, so that I can use it for personal accounting or tax purposes.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an "Export CSV" button within or adjacent to the Session_Table.
2. WHEN the mentor clicks "Export CSV", THE Dashboard SHALL generate and download a CSV file containing all session rows currently visible in the Session_Table (respecting any active filters or sort order).
3. THE exported CSV SHALL include the columns: Date, Mentee Name, Duration (min), Gross Amount, Platform Fee, Net Payout, Asset, Payout Status, Transaction Hash.
4. THE exported CSV file SHALL be named `mentor-earnings-{YYYY-MM-DD}.csv` using the current date at time of export.
5. IF the Session_Table contains zero rows, THE Dashboard SHALL disable the "Export CSV" button and display a tooltip reading "No data to export".
