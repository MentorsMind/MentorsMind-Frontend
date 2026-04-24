# Requirements Document

## Introduction

This feature makes the MentorsMind frontend fully responsive by replacing the current desktop-only sidebar navigation with a layout system that adapts to screen size. On desktop (≥768px), a persistent left sidebar shows nav links, user avatar, and quick stats. On mobile (<768px), a bottom tab bar replaces the sidebar for primary navigation, a hamburger-triggered slide-up drawer handles secondary items, all modals become full-screen bottom sheets, and the layout respects iOS/Android safe area insets and known 100vh quirks.

## Glossary

- **DashboardLayout**: The root layout component wrapping all authenticated pages, currently rendering the desktop sidebar.
- **Sidebar**: The persistent left-side navigation panel shown on desktop (viewport width ≥768px).
- **BottomTabBar**: The fixed bottom navigation bar shown on mobile (viewport width <768px) containing primary tab items.
- **HamburgerDrawer**: The slide-up overlay panel triggered by a hamburger icon on mobile, containing secondary navigation items.
- **BottomSheet**: A full-screen modal variant used on mobile that slides up from the bottom of the viewport.
- **SafeAreaInset**: Device-specific padding values exposed via CSS `env(safe-area-inset-*)` to avoid content being obscured by notches or home indicators.
- **TapTarget**: Any interactive element (button, link, icon) that a user can tap or click.
- **SwipeBackGesture**: A horizontal swipe-right gesture on a detail page that navigates to the previous route.
- **PrimaryTabItem**: One of the five main navigation destinations shown in the BottomTabBar: Home, Search, Bookings, Messages, Profile.
- **SecondaryNavItem**: Navigation items not in the BottomTabBar, including Settings, Wallet, Goals, and any role-specific items.
- **Viewport**: The visible area of the browser window.
- **100vh Bug**: A known iOS Safari issue where `100vh` includes the browser chrome height, causing layout overflow.

## Requirements

### Requirement 1: Desktop Sidebar Navigation

**User Story:** As a logged-in user on a desktop browser, I want a persistent left sidebar with navigation links, my avatar, and quick stats, so that I can navigate the app without losing context of the current page.

#### Acceptance Criteria

1. WHILE the Viewport width is ≥768px, THE DashboardLayout SHALL render the Sidebar on the left side of the page.
2. WHILE the Viewport width is ≥768px, THE Sidebar SHALL display all primary and secondary navigation links defined in `MAIN_NAVIGATION` and `USER_NAVIGATION`.
3. WHILE the Viewport width is ≥768px, THE Sidebar SHALL display the authenticated user's avatar, display name, and role label.
4. WHILE the Viewport width is ≥768px, THE Sidebar SHALL display at least two quick stats relevant to the user's role (e.g., upcoming sessions count and unread messages count for both roles).
5. WHEN a navigation link in the Sidebar is active, THE Sidebar SHALL visually distinguish the active link from inactive links using a distinct background color or indicator.
6. WHEN the user clicks the collapse toggle in the Sidebar, THE Sidebar SHALL transition between expanded (showing labels) and icon-only states while remaining visible.

### Requirement 2: Mobile Bottom Tab Bar

**User Story:** As a logged-in user on a mobile device, I want a bottom tab bar with icons for primary destinations, so that I can navigate the app with my thumb without reaching to the top of the screen.

#### Acceptance Criteria

1. WHILE the Viewport width is <768px, THE DashboardLayout SHALL render the BottomTabBar fixed to the bottom of the Viewport instead of the Sidebar.
2. THE BottomTabBar SHALL contain exactly five PrimaryTabItems: Home, Search, Bookings, Messages, and Profile.
3. THE BottomTabBar SHALL display an icon and a label for each PrimaryTabItem.
4. WHEN a PrimaryTabItem is active, THE BottomTabBar SHALL visually distinguish it from inactive items.
5. THE BottomTabBar SHALL apply bottom padding equal to the device's `env(safe-area-inset-bottom)` value to avoid overlap with the home indicator on notched devices.
6. WHEN the user taps a PrimaryTabItem, THE DashboardLayout SHALL navigate to the corresponding route without a full page reload.
7. THE BottomTabBar SHALL remain visible while the user scrolls the page content.

### Requirement 3: Mobile Hamburger Drawer for Secondary Navigation

**User Story:** As a logged-in user on a mobile device, I want to access secondary navigation items (Settings, Wallet, Goals, etc.) through a hamburger menu, so that the bottom tab bar stays uncluttered.

#### Acceptance Criteria

1. WHILE the Viewport width is <768px, THE DashboardLayout SHALL render a hamburger icon button in the top navigation bar.
2. WHEN the user taps the hamburger icon, THE HamburgerDrawer SHALL open and display all SecondaryNavItems.
3. THE HamburgerDrawer SHALL display the authenticated user's avatar, display name, and role label at the top of the drawer.
4. WHEN the user taps a SecondaryNavItem inside the HamburgerDrawer, THE HamburgerDrawer SHALL close and navigate to the selected route.
5. WHEN the user taps the backdrop behind the HamburgerDrawer, THE HamburgerDrawer SHALL close without navigating.
6. WHEN the HamburgerDrawer is open, THE DashboardLayout SHALL prevent the page content behind it from scrolling.
7. IF the HamburgerDrawer is open and the user presses the browser back button, THEN THE HamburgerDrawer SHALL close instead of navigating back.

### Requirement 4: Mobile Bottom Sheet Modals

**User Story:** As a user on a mobile device, I want modals to appear as full-screen bottom sheets, so that they feel native and are easy to interact with on a small screen.

#### Acceptance Criteria

1. WHILE the Viewport width is <768px, THE BottomSheet SHALL render modal dialogs as full-screen panels that slide up from the bottom of the Viewport.
2. WHILE the Viewport width is ≥768px, THE BottomSheet SHALL render as a standard centered modal dialog.
3. THE BottomSheet SHALL include a visible drag handle indicator at the top of the sheet on mobile.
4. WHEN the user swipes down on the BottomSheet drag handle, THE BottomSheet SHALL dismiss.
5. WHEN the user taps the backdrop behind the BottomSheet on mobile, THE BottomSheet SHALL dismiss.
6. THE BottomSheet SHALL apply top padding equal to `env(safe-area-inset-top)` on mobile to avoid overlap with the device status bar.
7. WHEN the BottomSheet is open on mobile, THE DashboardLayout SHALL prevent the page content behind it from scrolling.

### Requirement 5: Touch-Friendly Tap Targets

**User Story:** As a user on a touch device, I want all interactive elements to be large enough to tap accurately, so that I don't accidentally trigger the wrong action.

#### Acceptance Criteria

1. THE DashboardLayout SHALL ensure every TapTarget has a minimum rendered hit area of 44×44 CSS pixels on touch-capable devices.
2. THE BottomTabBar SHALL ensure each PrimaryTabItem has a minimum rendered hit area of 44×44 CSS pixels.
3. THE HamburgerDrawer SHALL ensure each SecondaryNavItem has a minimum rendered hit area of 44×44 CSS pixels.
4. WHEN a TapTarget is smaller than 44×44 CSS pixels in its visual size, THE DashboardLayout SHALL apply transparent padding to expand the hit area to the minimum without affecting layout.

### Requirement 6: Swipe-to-Go-Back Gesture on Detail Pages

**User Story:** As a user on a mobile device viewing a detail page, I want to swipe right to go back, so that navigation feels natural and consistent with native mobile apps.

#### Acceptance Criteria

1. WHILE the Viewport width is <768px and the user is on a detail page with a previous route in history, THE DashboardLayout SHALL detect a horizontal swipe-right gesture starting within 30px of the left edge of the screen.
2. WHEN a qualifying swipe-right gesture is completed with a horizontal displacement of ≥50px and a velocity of ≥0.3px/ms, THE DashboardLayout SHALL navigate to the previous route.
3. WHEN a qualifying swipe-right gesture is in progress, THE DashboardLayout SHALL show a visual indicator of the swipe progress.
4. IF the swipe gesture does not meet the displacement or velocity threshold, THEN THE DashboardLayout SHALL cancel the navigation and return the visual indicator to its initial state.
5. THE SwipeBackGesture SHALL NOT interfere with horizontal scrolling within page content areas.

### Requirement 7: No Horizontal Scroll

**User Story:** As a user on any device, I want the app to never produce a horizontal scrollbar, so that the layout always fits the screen width cleanly.

#### Acceptance Criteria

1. THE DashboardLayout SHALL constrain all child content to a maximum width equal to the Viewport width on all screen sizes.
2. WHEN the Viewport width is <768px, THE DashboardLayout SHALL apply `overflow-x: hidden` to the root layout container.
3. THE DashboardLayout SHALL ensure no fixed-width element wider than the Viewport width is rendered at any breakpoint.
4. IF a text or image element would overflow its container horizontally, THEN THE DashboardLayout SHALL apply word-wrap or object-fit constraints to prevent overflow.

### Requirement 8: iOS Safari and Android Chrome Compatibility

**User Story:** As a user on iOS Safari or Android Chrome, I want the layout to render correctly without visual glitches caused by browser-specific quirks, so that the app feels polished on the most common mobile browsers.

#### Acceptance Criteria

1. THE DashboardLayout SHALL use `min-height: -webkit-fill-available` or `min-height: 100dvh` as a fallback for `min-height: 100vh` to avoid the iOS Safari 100vh bug.
2. THE BottomTabBar SHALL use `padding-bottom: env(safe-area-inset-bottom)` to account for the iOS home indicator.
3. THE BottomSheet SHALL use `padding-top: env(safe-area-inset-top)` to account for the iOS status bar when rendered full-screen.
4. THE DashboardLayout SHALL include the `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` tag to enable safe area inset CSS variables on iOS.
5. WHEN rendered on Android Chrome, THE BottomTabBar SHALL remain fixed at the bottom of the Viewport and SHALL NOT be pushed up by the on-screen keyboard when an input field is focused.
6. THE DashboardLayout SHALL use `-webkit-overflow-scrolling: touch` or `overscroll-behavior` on scrollable containers to enable momentum scrolling on iOS Safari.
