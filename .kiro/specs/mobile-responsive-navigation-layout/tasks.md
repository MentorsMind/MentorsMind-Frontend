# Implementation Plan: Mobile-Responsive Navigation & Layout

## Overview

Incrementally build the breakpoint-driven layout system: hooks first, then leaf components, then the layout shell that wires everything together. Each step is independently testable before the next builds on it.

## Tasks

- [x] 1. Add viewport meta tag and global layout foundations
  - Update `index.html` to include `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
  - Apply `min-h-[100dvh]` with `-webkit-fill-available` fallback and `overflow-x: hidden` to the root layout container in `DashboardLayout`
  - Add `overscroll-behavior` and `-webkit-overflow-scrolling: touch` to scrollable containers
  - _Requirements: 7.2, 8.1, 8.4, 8.6_

- [x] 2. Implement `useNavLayout` hook
  - [x] 2.1 Create `src/hooks/useNavLayout.ts`
    - Implement `drawerOpen`, `openDrawer`, `closeDrawer` state
    - Implement `sidebarCollapsed` / `toggleSidebarCollapse` with `localStorage` persistence under key `mm_sidebar_collapsed`
    - _Requirements: 1.6, 3.1_

  - [ ]* 2.2 Write unit tests for `useNavLayout`
    - Test drawer open/close state transitions
    - Test sidebar collapse persists to and rehydrates from `localStorage`
    - _Requirements: 1.6, 3.1_

  - [ ]* 2.3 Write property test for sidebar collapse round-trip (P2)
    - `// Feature: mobile-responsive-navigation-layout, Property 2: Sidebar collapse is a round-trip`
    - Generator: `fc.boolean()` for initial collapsed state
    - Assert toggle → toggle returns to original state; labels visible when expanded, hidden when collapsed
    - **Property 2: Sidebar collapse round-trip**
    - **Validates: Requirements 1.6**

- [x] 3. Implement enhanced `Sidebar` component
  - [x] 3.1 Extend `src/components/dashboard/Sidebar.tsx`
    - Accept `collapsed` and `onToggleCollapse` props
    - Render user avatar, display name, and role label from `useAuth`
    - Render quick stats (upcoming sessions + unread messages)
    - Render all `MAIN_NAVIGATION` and `USER_NAVIGATION` items filtered by role
    - Add active link indicator; add collapse toggle button
    - Render skeleton/placeholder when `useAuth` returns null
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 3.2 Write unit tests for `Sidebar`
    - Test avatar, name, role label render
    - Test nav items filtered by role
    - Test active link styling
    - Test collapse toggle shows/hides labels
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 3.3 Write property test for sidebar nav completeness (P1)
    - `// Feature: mobile-responsive-navigation-layout, Property 1: Sidebar renders complete navigation and user identity`
    - Generator: `fc.record({ name: fc.string(), role: fc.constantFrom('mentor', 'learner') })`
    - Assert every role-filtered nav item is present and display name + role label are rendered
    - **Property 1: Sidebar nav completeness**
    - **Validates: Requirements 1.2, 1.3**

- [x] 4. Implement `BottomTabBar` component
  - [x] 4.1 Create `src/components/navigation/BottomTabBar.tsx`
    - Define `MENTOR_TABS` and `LEARNER_TABS` constants (5 items each)
    - Render fixed bottom bar with `padding-bottom: env(safe-area-inset-bottom)`
    - Each tab: min 44×44px hit area, icon + label, active state highlight via `NavLink`
    - Accept `tabs` and `onHamburgerPress` props
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 5.2, 8.2_

  - [ ]* 4.2 Write unit tests for `BottomTabBar`
    - Test exactly 5 tabs rendered
    - Test active tab highlighting
    - Test `onHamburgerPress` callback fires
    - _Requirements: 2.2, 2.3, 2.4, 2.6_

  - [ ]* 4.3 Write property test for tab navigation (P3)
    - `// Feature: mobile-responsive-navigation-layout, Property 3: Each tab item navigates to its defined route`
    - Generator: `fc.constantFrom(...MENTOR_TABS, ...LEARNER_TABS)`
    - Assert tapping each tab triggers navigation to exactly its `to` path
    - **Property 3: Tab item navigation**
    - **Validates: Requirements 2.6**

  - [ ]* 4.4 Write property test for 44×44px tap targets (P7) — BottomTabBar
    - `// Feature: mobile-responsive-navigation-layout, Property 7: All interactive elements meet the 44×44px minimum tap target`
    - Query all interactive elements after render; assert each has hit area ≥ 44×44px
    - **Property 7: 44×44px tap targets (BottomTabBar)**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 5. Implement `HamburgerDrawer` component
  - [x] 5.1 Create `src/components/navigation/HamburgerDrawer.tsx`
    - Slide-in from left with backdrop overlay
    - Render user avatar, display name, role label at top (from `useAuth`)
    - Render each `secondaryNavItems` as a `NavLink` with min 44×44px hit area
    - Apply `document.body.style.overflow = 'hidden'` while open; clean up on close
    - Add `popstate` listener: if open, call `onClose()` and `history.pushState` to intercept back button
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 5.3_

  - [ ]* 5.2 Write unit tests for `HamburgerDrawer`
    - Test opens on hamburger press, closes on backdrop click
    - Test scroll lock applied/removed
    - Test back-button interception closes drawer without navigating
    - _Requirements: 3.2, 3.5, 3.6, 3.7_

  - [ ]* 5.3 Write property test for drawer user info + nav items (P4)
    - `// Feature: mobile-responsive-navigation-layout, Property 4: HamburgerDrawer shows user info and all secondary nav items`
    - Generator: `fc.record({ user: fc.record({ name: fc.string(), role: fc.constantFrom('mentor','learner') }), navItems: fc.array(fc.record({ label: fc.string(), to: fc.string() }), { minLength: 1, maxLength: 10 }) })`
    - Assert display name, role label, and every nav item are rendered
    - **Property 4: Drawer shows user info + nav items**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 5.4 Write property test for secondary nav item closes + navigates (P5)
    - `// Feature: mobile-responsive-navigation-layout, Property 5: Tapping any secondary nav item closes drawer and navigates`
    - Generator: `fc.constantFrom(...secondaryNavItems)`
    - Assert tapping any item sets `isOpen` to false and triggers navigation to that item's path
    - **Property 5: Secondary nav item closes + navigates**
    - **Validates: Requirements 3.4**

  - [ ]* 5.5 Write property test for 44×44px tap targets (P7) — HamburgerDrawer
    - `// Feature: mobile-responsive-navigation-layout, Property 7: All interactive elements meet the 44×44px minimum tap target`
    - Query all interactive elements in open drawer; assert each ≥ 44×44px
    - **Property 7: 44×44px tap targets (HamburgerDrawer)**
    - **Validates: Requirements 5.1, 5.3, 5.4**

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Enhance `BottomSheet` component
  - [x] 7.1 Extend `src/components/mobile/MobileModal.tsx` BottomSheet export
    - Add drag handle bar at top of sheet on mobile
    - Add swipe-down-to-dismiss via touch tracking on the handle (reuse `TouchGestures` pattern)
    - Apply `padding-top: env(safe-area-inset-top)` when full-screen on mobile
    - Auto-select `position` based on `isMobile`: full-screen on mobile, centered dialog on desktop
    - Apply scroll lock (`document.body.style.overflow`) while open; clean up on close
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 8.3_

  - [ ]* 7.2 Write unit tests for `BottomSheet`
    - Test full-screen on mobile, centered on desktop
    - Test drag handle present on mobile
    - Test backdrop tap dismisses
    - Test scroll lock applied/removed
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.7_

  - [ ]* 7.3 Write property test for swipe-down dismissal (P6)
    - `// Feature: mobile-responsive-navigation-layout, Property 6: Swipe-down on BottomSheet drag handle dismisses the sheet`
    - Generator: `fc.record({ deltaY: fc.integer({ min: 60, max: 300 }) })`
    - Assert simulating downward swipe on drag handle calls `onClose`
    - **Property 6: Swipe-down dismisses BottomSheet**
    - **Validates: Requirements 4.4**

- [x] 8. Implement `useSwipeBack` hook
  - [x] 8.1 Create `src/hooks/useSwipeBack.ts`
    - On `touchstart`: record start point only if `touch.clientX <= edgeThreshold` (default 30px)
    - On `touchmove`: compute `deltaX`; if horizontal-dominant and `deltaX > 0`, update `swipeProgress = deltaX / window.innerWidth`; cancel if inside a horizontally scrollable element
    - On `touchend`: compute velocity = `deltaX / deltaTime`; if `deltaX >= minDisplacement (50px)` and `velocity >= minVelocity (0.3px/ms)` → call `navigate(-1)`; else reset `swipeProgress` to 0
    - Return `swipeProgress` and `containerProps`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 8.2 Write property test for qualifying swipe triggers navigate(-1) (P8)
    - `// Feature: mobile-responsive-navigation-layout, Property 8: Qualifying swipe-right triggers back navigation`
    - Generator: `fc.record({ startX: fc.integer({ min: 0, max: 29 }), deltaX: fc.integer({ min: 50, max: 300 }), deltaTime: fc.integer({ min: 1, max: 166 }) })`
    - Assert `navigate(-1)` is called for all qualifying inputs
    - **Property 8: Qualifying swipe triggers navigate(-1)**
    - **Validates: Requirements 6.2**

  - [ ]* 8.3 Write property test for non-qualifying swipe resets progress (P9)
    - `// Feature: mobile-responsive-navigation-layout, Property 9: Non-qualifying swipe resets the progress indicator`
    - Generator: `fc.record({ startX: fc.integer({ min: 0, max: 29 }), deltaX: fc.integer({ min: 0, max: 49 }), deltaTime: fc.integer({ min: 1, max: 500 }) })`
    - Assert `swipeProgress` returns to 0 after `touchend`
    - **Property 9: Non-qualifying swipe resets progress**
    - **Validates: Requirements 6.4**

  - [ ]* 8.4 Write property test for out-of-zone swipe no navigation (P10)
    - `// Feature: mobile-responsive-navigation-layout, Property 10: Swipe starting outside the edge zone does not trigger navigation`
    - Generator: `fc.record({ startX: fc.integer({ min: 31, max: 400 }), deltaX: fc.integer({ min: 50, max: 300 }) })`
    - Assert `navigate(-1)` is never called
    - **Property 10: Out-of-zone swipe no navigation**
    - **Validates: Requirements 6.5**

- [x] 9. Refactor `DashboardLayout` to wire everything together
  - [x] 9.1 Refactor `src/layouts/DashboardLayout.tsx` (or equivalent)
    - Consume `useNavLayout` for drawer and sidebar collapse state
    - Render `<Sidebar>` with `hidden md:flex`, passing `collapsed` and `onToggleCollapse`
    - Render `<BottomTabBar>` with `flex md:hidden`, passing role-appropriate tabs and `openDrawer`
    - Render `<HamburgerDrawer>` controlled by `drawerOpen` / `closeDrawer`
    - Mount `useSwipeBack` on detail pages (pass `enabled` based on `isMobile` and history depth)
    - Render `SwipeBackIndicator` overlay driven by `swipeProgress`
    - Add bottom padding on mobile to account for tab bar height + safe area
    - _Requirements: 1.1, 2.1, 3.1, 6.1, 6.3, 7.1, 7.2, 8.1, 8.5, 8.6_

  - [ ]* 9.2 Write unit tests for `DashboardLayout`
    - Test Sidebar rendered at ≥768px, BottomTabBar at <768px
    - Test hamburger press opens drawer
    - Test `min-height: 100dvh` on root container
    - Test `overflow-x: hidden` at mobile viewport
    - Test `viewport-fit=cover` meta tag present in document head
    - _Requirements: 1.1, 2.1, 3.1, 7.2, 8.1, 8.4_

  - [ ]* 9.3 Write property test for no horizontal overflow (P11)
    - `// Feature: mobile-responsive-navigation-layout, Property 11: No child element exceeds the viewport width`
    - Generator: `fc.string({ minLength: 100, maxLength: 500 })` as content; various viewport widths
    - Assert no child element's `scrollWidth` or `offsetWidth` exceeds viewport width
    - **Property 11: No horizontal overflow**
    - **Validates: Requirements 7.1, 7.3, 7.4**

  - [ ]* 9.4 Write property test for 44×44px tap targets (P7) — DashboardLayout
    - `// Feature: mobile-responsive-navigation-layout, Property 7: All interactive elements meet the 44×44px minimum tap target`
    - Query all interactive elements rendered within DashboardLayout; assert each ≥ 44×44px
    - **Property 7: 44×44px tap targets (DashboardLayout)**
    - **Validates: Requirements 5.1, 5.4**

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property
- Each property test must include the comment tag: `// Feature: mobile-responsive-navigation-layout, Property N: <property_text>`
- Test files live in: `src/components/navigation/__tests__/`, `src/components/dashboard/__tests__/`, `src/layouts/__tests__/`, `src/hooks/__tests__/`
