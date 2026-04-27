# Requirements Document

## Introduction

This feature adds browser push notification permission handling and device token management to the frontend. The backend already supports Firebase Cloud Messaging (FCM) via `/notifications/push/subscribe`, `/notifications/push/unsubscribe`, `/notifications/push/tokens`, and `/notifications/push/test`. The frontend needs to request browser permission non-intrusively, register FCM tokens, and provide a settings page for managing registered devices.

## Glossary

- **Permission_Banner**: A non-intrusive UI banner shown after first login prompting the user to enable push notifications.
- **FCM_Token**: A Firebase Cloud Messaging device token uniquely identifying a browser/device combination for push delivery.
- **Notification_Service**: The frontend service responsible for interacting with the browser Push API, obtaining FCM tokens, and calling backend notification endpoints.
- **Device_Manager**: The UI component on the notifications settings page that lists registered devices and allows removal.
- **Push_API**: The browser's native Push Notification API used to request permission and receive push messages.
- **Settings_Page**: The notifications settings page where users manage their registered push notification devices.

---

## Requirements

### Requirement 1: Non-Intrusive Permission Banner on First Login

**User Story:** As a user, I want to see a friendly banner explaining push notifications after I first log in, so that I can make an informed decision before the browser permission dialog appears.

#### Acceptance Criteria

1. WHEN a user logs in for the first time and has not previously responded to the push notification prompt, THE Permission_Banner SHALL be displayed without triggering the browser permission dialog.
2. THE Permission_Banner SHALL include a brief description of the benefit of enabling push notifications, an "Enable" button, and a "Not now" button.
3. WHEN the user clicks "Not now", THE Permission_Banner SHALL be dismissed and THE Notification_Service SHALL record the dismissal so the banner is not shown again in the same session.
4. WHEN the user has previously granted or denied push notification permission, THE Permission_Banner SHALL NOT be displayed on subsequent logins.

---

### Requirement 2: FCM Token Registration on Permission Grant

**User Story:** As a user, I want clicking "Enable" to request browser permission and register my device, so that I start receiving push notifications immediately.

#### Acceptance Criteria

1. WHEN the user clicks "Enable" on the Permission_Banner, THE Notification_Service SHALL invoke the browser Push API permission request dialog.
2. WHEN the browser permission is granted, THE Notification_Service SHALL retrieve the FCM_Token for the current browser/device.
3. WHEN the FCM_Token is retrieved, THE Notification_Service SHALL call `POST /notifications/push/subscribe` with the FCM_Token and a device name derived from the browser user-agent.
4. IF the `POST /notifications/push/subscribe` call fails, THEN THE Notification_Service SHALL display an error message informing the user that registration failed and to try again.
5. WHEN registration succeeds, THE Permission_Banner SHALL be dismissed.

---

### Requirement 3: Denied Permission Help Tooltip

**User Story:** As a user, I want guidance on re-enabling push notifications if I accidentally deny permission, so that I can fix the setting without searching browser documentation.

#### Acceptance Criteria

1. WHEN the browser permission request is denied by the user, THE Notification_Service SHALL display a help tooltip explaining how to re-enable push notifications in browser settings.
2. THE help tooltip SHALL include browser-specific instructions for at least Chrome, Firefox, and Safari.
3. WHEN the user dismisses the help tooltip, THE Notification_Service SHALL record the denial so the permission request is not triggered again automatically.

---

### Requirement 4: Registered Device List on Settings Page

**User Story:** As a user, I want to see all devices registered for push notifications on my settings page, so that I can review and manage which devices receive notifications.

#### Acceptance Criteria

1. WHEN the user navigates to the Settings_Page, THE Device_Manager SHALL call `GET /notifications/push/tokens` to retrieve the list of registered devices.
2. THE Device_Manager SHALL display each registered device with its device name, browser, and last active date.
3. WHILE the device list is loading, THE Device_Manager SHALL display a loading indicator.
4. IF `GET /notifications/push/tokens` returns an error, THEN THE Device_Manager SHALL display an error message and a retry option.
5. IF no devices are registered, THEN THE Device_Manager SHALL display an empty state message indicating no devices are registered.

---

### Requirement 5: Device Token Removal

**User Story:** As a user, I want to remove a registered device from my account, so that I can stop push notifications on devices I no longer use.

#### Acceptance Criteria

1. THE Device_Manager SHALL display a "Remove" button for each registered device in the device list.
2. WHEN the user clicks "Remove" for a device, THE Device_Manager SHALL call `DELETE /notifications/push/unsubscribe` with the corresponding FCM_Token.
3. WHEN the removal call succeeds, THE Device_Manager SHALL remove the device entry from the displayed list without requiring a full page reload.
4. IF the `DELETE /notifications/push/unsubscribe` call fails, THEN THE Device_Manager SHALL display an error message and leave the device entry in the list.

---

### Requirement 6: Send Test Notification

**User Story:** As a user, I want to send a test push notification to verify my setup is working, so that I can confirm notifications will be delivered correctly.

#### Acceptance Criteria

1. THE Device_Manager SHALL display a "Send test notification" button on the Settings_Page.
2. WHEN the user clicks "Send test notification", THE Notification_Service SHALL call `POST /notifications/push/test`.
3. WHEN the test call succeeds, THE Notification_Service SHALL display a confirmation message indicating the test notification was sent.
4. IF the `POST /notifications/push/test` call fails, THEN THE Notification_Service SHALL display an error message describing the failure.
5. WHILE the test notification request is in progress, THE "Send test notification" button SHALL be disabled to prevent duplicate requests.
