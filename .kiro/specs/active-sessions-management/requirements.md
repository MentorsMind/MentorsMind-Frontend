# Requirements Document

## Introduction

The Active Sessions Management feature gives users visibility into all active login sessions associated with their account, directly within the Security settings tab. Users can see where their account is currently logged in (device type, browser, OS, IP address, approximate location, and last activity time), identify their current session, revoke individual sessions, and sign out all other devices at once. A warning banner alerts users when a session originates from an unusual location or unrecognized device, closing a significant security gap in the current product.

The feature integrates with two existing backend endpoints:
- `GET /auth/sessions` — returns all active sessions for the authenticated user
- `DELETE /auth/sessions/:id` — revokes a specific session by ID
- `DELETE /auth/sessions` — revokes all sessions except the current one

---

## Glossary

- **Session**: A record of an authenticated login instance, including device metadata, IP address, location, and activity timestamps, as returned by the backend.
- **Current_Session**: The session associated with the user's active browser tab and authentication token.
- **Session_Card**: A UI component that displays the details of a single session.
- **Sessions_Panel**: The "Active Sessions" section rendered within the Security settings tab.
- **Session_List**: The collection of Session_Cards displayed within the Sessions_Panel.
- **Revoke_Action**: The user-initiated action to terminate a specific non-current session via `DELETE /auth/sessions/:id`.
- **Sign_Out_All_Action**: The user-initiated action to terminate all sessions except the Current_Session via `DELETE /auth/sessions`.
- **Unusual_Session**: A session flagged by the backend as originating from an unrecognized device or an atypical geographic location relative to the user's history.
- **Location_Service**: The client-side utility that derives approximate city and country from the IP address provided by the backend.
- **Sessions_API**: The backend REST API exposing `GET /auth/sessions`, `DELETE /auth/sessions/:id`, and `DELETE /auth/sessions`.

---

## Requirements

### Requirement 1: Display Active Sessions Section

**User Story:** As a user, I want to see an "Active Sessions" section in my Security settings tab, so that I have a clear overview of all places my account is currently logged in.

#### Acceptance Criteria

1. THE Sessions_Panel SHALL be rendered within the Security settings tab as a distinct, labeled section titled "Active Sessions".
2. WHEN the Security settings tab is opened, THE Sessions_Panel SHALL fetch the current session list from the Sessions_API via `GET /auth/sessions`.
3. WHILE the Sessions_API request is in progress, THE Sessions_Panel SHALL display a loading indicator in place of the Session_List.
4. IF the Sessions_API request fails, THEN THE Sessions_Panel SHALL display an error message describing the failure and a "Retry" button that re-triggers the fetch.
5. WHEN the Sessions_API returns an empty list, THE Sessions_Panel SHALL display a message indicating no active sessions were found.

---

### Requirement 2: Session Card Content

**User Story:** As a user, I want each session card to show device type, browser, OS, IP address, approximate location, and last activity time, so that I can identify each login at a glance.

#### Acceptance Criteria

1. THE Session_Card SHALL display a device type icon representing one of three categories: mobile, desktop, or tablet, derived from the user-agent string provided by the Sessions_API.
2. THE Session_Card SHALL display the browser name parsed from the user-agent string provided by the Sessions_API.
3. THE Session_Card SHALL display the operating system name parsed from the user-agent string provided by the Sessions_API.
4. THE Session_Card SHALL display the IP address as provided by the Sessions_API.
5. THE Session_Card SHALL display the approximate location as a city and country string derived from the IP address via the Location_Service.
6. IF the Location_Service cannot resolve a location for the given IP address, THEN THE Session_Card SHALL display "Location unavailable" in place of the city and country.
7. THE Session_Card SHALL display the last active time as a human-readable relative string in the format "Last active X minutes ago", "Last active X hours ago", or "Last active X days ago", calculated from the `lastActiveAt` timestamp provided by the Sessions_API.

---

### Requirement 3: Current Session Identification

**User Story:** As a user, I want my current session to be visually highlighted with a "This device" badge, so that I can immediately distinguish it from other sessions.

#### Acceptance Criteria

1. THE Sessions_Panel SHALL identify the Current_Session by matching the session ID returned by the Sessions_API against the session ID embedded in the user's active authentication token.
2. THE Session_Card for the Current_Session SHALL display a "This device" badge adjacent to the device type icon.
3. THE Session_Card for the Current_Session SHALL be rendered with a distinct visual treatment (e.g., highlighted border or background) that differentiates it from non-current Session_Cards.
4. THE Session_Card for the Current_Session SHALL be positioned at the top of the Session_List.

---

### Requirement 4: Revoke Individual Session

**User Story:** As a user, I want to revoke any non-current session with a confirmation step, so that I can remove unauthorized access without accidentally revoking the wrong session.

#### Acceptance Criteria

1. THE Session_Card for each non-current session SHALL display a "Revoke" button.
2. WHEN the user activates the "Revoke" button on a Session_Card, THE Sessions_Panel SHALL display a confirmation dialog asking the user to confirm the revocation of that specific session.
3. WHEN the user confirms the revocation, THE Sessions_Panel SHALL call `DELETE /auth/sessions/:id` with the corresponding session ID.
4. WHILE the revocation request is in progress, THE Sessions_Panel SHALL disable the "Revoke" button on the targeted Session_Card to prevent duplicate requests.
5. WHEN the revocation request succeeds, THE Sessions_Panel SHALL remove the corresponding Session_Card from the Session_List using a smooth fade-out and collapse animation completing within 300ms.
6. IF the revocation request fails, THEN THE Sessions_Panel SHALL display an inline error message on the targeted Session_Card and re-enable the "Revoke" button.
7. WHEN the user cancels the confirmation dialog, THE Sessions_Panel SHALL dismiss the dialog and take no further action.

---

### Requirement 5: Sign Out All Other Devices

**User Story:** As a user, I want a "Sign out all other devices" button that revokes all non-current sessions at once, so that I can quickly secure my account if I suspect unauthorized access.

#### Acceptance Criteria

1. THE Sessions_Panel SHALL display a "Sign out all other devices" button at the top of the Session_List.
2. WHEN the Session_List contains only the Current_Session, THE Sessions_Panel SHALL disable the "Sign out all other devices" button.
3. WHEN the user activates the "Sign out all other devices" button, THE Sessions_Panel SHALL display a confirmation dialog stating that all other sessions will be terminated.
4. WHEN the user confirms the action, THE Sessions_Panel SHALL call `DELETE /auth/sessions`.
5. WHILE the request is in progress, THE Sessions_Panel SHALL disable the "Sign out all other devices" button to prevent duplicate requests.
6. WHEN the request succeeds, THE Sessions_Panel SHALL remove all non-current Session_Cards from the Session_List using a smooth fade-out and collapse animation completing within 300ms.
7. IF the request fails, THEN THE Sessions_Panel SHALL display an error message and re-enable the "Sign out all other devices" button.
8. WHEN the user cancels the confirmation dialog, THE Sessions_Panel SHALL dismiss the dialog and take no further action.

---

### Requirement 6: Unusual Session Warning Banner

**User Story:** As a user, I want to see a warning banner when a session is detected from an unusual location or new device, so that I can take immediate action if my account has been compromised.

#### Acceptance Criteria

1. WHEN the Sessions_API response includes one or more sessions flagged as unusual (via an `isUnusual` or equivalent field), THE Sessions_Panel SHALL display a warning banner above the Session_List.
2. THE warning banner SHALL contain a message indicating that a session from an unusual location or unrecognized device has been detected, and SHALL prompt the user to review their sessions.
3. THE warning banner SHALL remain visible until the user either dismisses it manually or all flagged sessions have been revoked.
4. WHEN all flagged sessions are revoked, THE Sessions_Panel SHALL automatically remove the warning banner.
5. THE Session_Card for each flagged session SHALL display a visual indicator (e.g., a warning icon) to distinguish it from non-flagged sessions.

---

### Requirement 7: Session List Refresh

**User Story:** As a user, I want the session list to reflect the latest state after any revocation action, so that I always see accurate information about my active sessions.

#### Acceptance Criteria

1. WHEN a Revoke_Action or Sign_Out_All_Action completes successfully, THE Sessions_Panel SHALL update the Session_List to reflect only the remaining active sessions without requiring a full page reload.
2. THE Sessions_Panel SHALL provide a manual "Refresh" control that, when activated, re-fetches the session list from the Sessions_API.
3. WHILE a refresh is in progress, THE Sessions_Panel SHALL display a loading indicator and disable the "Refresh" control to prevent duplicate requests.
