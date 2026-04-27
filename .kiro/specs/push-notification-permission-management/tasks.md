# Implementation Plan: Push Notification Permission Management

## Overview

Implement browser push notification permission handling and FCM device token management. This covers the `pushNotification.service.ts` service, `usePushNotifications` hook, `PermissionBanner`, `DeniedTooltip`, and `DeviceManager` components, wired into the existing `DashboardLayout` and `NotificationSettings` page.

## Tasks

- [x] 1. Create push notification service
  - [x] 1.1 Create `src/services/pushNotification.service.ts` with `subscribe`, `unsubscribe`, `getTokens`, and `sendTest` methods wrapping the four backend endpoints via the existing `api.client.ts` Axios instance
    - Define `PushDevice` and `PushSubscribeRequest` interfaces in `src/types/pushNotification.types.ts`
    - _Requirements: 2.3, 4.1, 5.2, 6.2_
  - [ ]* 1.2 Write property test for subscribe call body (Property 3)
    - **Property 3: Subscribe call includes token and device name**
    - **Validates: Requirements 2.3**

- [x] 2. Implement `deriveDeviceName` utility
  - [x] 2.1 Create `src/utils/pushNotification.utils.ts` with `deriveDeviceName(userAgent: string): string` that parses `navigator.userAgent` into a human-readable label (e.g. "Chrome on macOS")
    - _Requirements: 2.3_
  - [ ]* 2.2 Write property test for device name derivation (Property 7)
    - **Property 7: Device name derivation is deterministic**
    - **Validates: Requirements 2.3**

- [x] 3. Implement `usePushNotifications` hook
  - [x] 3.1 Create `src/hooks/usePushNotifications.ts` implementing the `UsePushNotificationsReturn` interface
    - Read `mm_push_permission_state` from `localStorage` and `mm_push_banner_dismissed` from `sessionStorage` to derive initial `showBanner` and `permissionState`
    - Implement `dismissBanner` to set `sessionStorage['mm_push_banner_dismissed'] = 'true'` and update `showBanner`
    - Implement `requestPermission` with the full flow: `Notification.requestPermission()` → Firebase `getToken` (lazy import) → `pushNotificationService.subscribe` → persist state
    - Handle browser Push API unsupported case by returning `showBanner = false`
    - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.3_
  - [ ]* 3.2 Write property test for banner visibility logic (Property 1)
    - **Property 1: Banner visibility matches permission and dismissal state**
    - **Validates: Requirements 1.1, 1.4**
  - [ ]* 3.3 Write property test for dismissal suppression (Property 2)
    - **Property 2: Dismissal suppresses banner for the session**
    - **Validates: Requirements 1.3**

- [x] 4. Implement `PermissionBanner` component
  - [x] 4.1 Create `src/components/notifications/PermissionBanner.tsx` matching the `PermissionBannerProps` interface
    - Render a dismissible top banner with a description, "Enable" button (disabled while `isLoading`), "Not now" button, and inline error display
    - Style consistent with existing banner patterns in the codebase
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 2.5_
  - [ ]* 4.2 Write unit tests for `PermissionBanner`
    - Test renders "Enable" and "Not now" buttons
    - Test shows error message when `error` prop is set
    - Test disables "Enable" button when `isLoading` is true
    - _Requirements: 1.2, 2.4_

- [x] 5. Implement `DeniedTooltip` component
  - [x] 5.1 Create `src/components/notifications/DeniedTooltip.tsx` matching the `DeniedTooltipProps` interface
    - Render a modal-style overlay with browser-specific re-enable instructions for Chrome, Firefox, and Safari
    - Detect browser from `navigator.userAgent` and highlight the relevant section
    - _Requirements: 3.1, 3.2_
  - [ ]* 5.2 Write unit tests for `DeniedTooltip`
    - Test renders Chrome instructions when user-agent contains "Chrome"
    - Test renders Firefox instructions when user-agent contains "Firefox"
    - Test renders Safari instructions when user-agent contains "Safari"
    - _Requirements: 3.2_

- [x] 6. Wire `PermissionBanner` and `DeniedTooltip` into `DashboardLayout`
  - [x] 6.1 Update `src/layouts/DashboardLayout.tsx` to consume `usePushNotifications` and render `PermissionBanner` (when `showBanner`) and `DeniedTooltip` (when permission is denied and tooltip not yet dismissed) above the main content area
    - _Requirements: 1.1, 3.1_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement `DeviceManager` component
  - [x] 8.1 Create `src/components/notifications/DeviceManager.tsx` with internal state for `devices`, `loading`, `error`, `removingId`, and `testStatus`
    - On mount, call `pushNotificationService.getTokens()` and populate the device list
    - Render loading indicator while fetching, empty state when list is empty, and error + retry when fetch fails
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 8.2 Write unit tests for `DeviceManager` fetch states
    - Test shows loading indicator while fetching
    - Test shows empty state when device list is empty
    - Test shows error + retry when `GET /tokens` fails
    - _Requirements: 4.3, 4.4, 4.5_
  - [ ]* 8.3 Write property test for device row completeness (Property 4)
    - **Property 4: Device row completeness**
    - **Validates: Requirements 4.2, 5.1**

- [x] 9. Implement device removal in `DeviceManager`
  - [x] 9.1 Add remove handler to `DeviceManager` that calls `pushNotificationService.unsubscribe(token)`, removes the entry from the list on success, and shows an inline error leaving the entry in place on failure
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 9.2 Write property test for successful removal (Property 5)
    - **Property 5: Device list reflects removal**
    - **Validates: Requirements 5.3**
  - [ ]* 9.3 Write property test for failed removal (Property 6)
    - **Property 6: Failed removal leaves list unchanged**
    - **Validates: Requirements 5.4**

- [x] 10. Implement test notification in `DeviceManager`
  - [x] 10.1 Add "Send test notification" button to `DeviceManager` that calls `pushNotificationService.sendTest()`, sets `testStatus` accordingly, and disables the button while the request is in-flight
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 10.2 Write property test for test button disabled state (Property 8)
    - **Property 8: Test button disabled while request is in-flight**
    - **Validates: Requirements 6.5**

- [x] 11. Wire `DeviceManager` into the Settings Notifications tab
  - [x] 11.1 Update the existing `NotificationSettings` component to include `DeviceManager` as a new section
    - _Requirements: 4.1, 5.1, 6.1_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** (already in `devDependencies`)
- Firebase SDK modules (`firebase/app`, `firebase/messaging`) are imported lazily inside `requestPermission` to keep the initial bundle small
- All API calls go through the existing `api.client.ts` Axios instance
