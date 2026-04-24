# Implementation Plan: Dark Mode Theme Support

## Overview

Implement a full theme token system and dark mode for the MentorsMind frontend. The approach uses CSS custom properties as the single source of truth for all colors, a dedicated `ThemeContext` for state management, backend persistence via `PUT /users/me`, and `localStorage` fallback for unauthenticated users.

## Tasks

- [x] 1. Define CSS token system and Tailwind configuration
  - Add `:root` and `.dark` CSS custom property token definitions to `src/index.css`
  - Add global 200ms transition rule with `prefers-reduced-motion` override to `src/index.css`
  - Extend `tailwind.config.js` `theme.extend.colors` to map utility classes to CSS token variables
  - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2_

  - [ ]* 1.1 Write property test for WCAG AA contrast ratios (Property 10)
    - **Property 10: WCAG AA contrast ratios for all token pairs**
    - Enumerate all (foreground, background) token pairings in both light and dark sets and assert ≥ 4.5:1 for normal text and ≥ 3:1 for large text / UI components
    - Create `src/__tests__/theme.tokens.test.ts`
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [x] 2. Create ThemeContext, ThemeProvider, and useTheme hook
  - Create `src/contexts/ThemeContext.tsx` with `ThemePreference`, `ResolvedTheme`, and `ThemeContextType` types
  - Implement `ThemeProvider`: resolve initial theme from user profile → `localStorage` → `prefers-color-scheme` → `'light'`; apply `.dark` class synchronously on mount; listen for `prefers-color-scheme` changes when preference is `'system'`
  - Implement `setTheme`: update state, apply/remove `.dark` class, write to `localStorage` under `mm_theme_preference`, call `persistThemePreference` if authenticated, show error toast on API failure
  - Create `src/hooks/useTheme.ts` as a thin `useContext` wrapper with an out-of-provider guard
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.1 Write property test for system preference on first visit (Property 2)
    - **Property 2: System preference is respected on first visit**
    - Generator: `fc.constantFrom('light', 'dark')` with empty localStorage mock
    - Create `src/__tests__/ThemeContext.test.tsx`
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 2.2 Write property test for runtime system preference change (Property 3)
    - **Property 3: Runtime system preference change is reflected**
    - Generator: `fc.constantFrom('light', 'dark')` with stored preference `'system'`
    - **Validates: Requirements 2.4**

  - [ ]* 2.3 Write property test for .dark class correctness (Property 4)
    - **Property 4: setTheme applies the .dark class correctly**
    - Generator: `fc.constantFrom('light', 'dark', 'system')` × `fc.constantFrom('light', 'dark')` for system pref
    - **Validates: Requirements 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

  - [ ]* 2.4 Write property test for unauthenticated localStorage persistence (Property 9)
    - **Property 9: Unauthenticated preference is persisted to localStorage**
    - Generator: `fc.constantFrom('light', 'dark', 'system')` with no auth context
    - **Validates: Requirements 4.5**

  - [ ]* 2.5 Write unit tests for ThemeProvider initialization and error handling
    - Test initialization from user profile, from localStorage, and fallback to system preference
    - Test `.dark` class applied/removed correctly
    - Test error toast shown when `PUT /users/me` fails
    - **Validates: Requirements 2.1, 4.3, 4.4**

- [x] 3. Create theme.service.ts
  - Create `src/services/theme.service.ts` with `persistThemePreference(preference: ThemePreference): Promise<void>`
  - Call `PUT /users/me` with `{ theme_preference: preference }`; throw on non-2xx
  - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 3.1 Write property test for PUT /users/me called within 500ms (Property 6)
    - **Property 6: Theme change triggers PUT /users/me within 500ms**
    - Generator: `fc.constantFrom('light', 'dark', 'system')` with fake timers
    - Create `src/__tests__/theme.service.test.ts`
    - **Validates: Requirements 4.1**

  - [ ]* 3.2 Write property test for successful API response retains preference (Property 7)
    - **Property 7: Successful API response retains new preference**
    - Generator: `fc.constantFrom('light', 'dark', 'system')` with mocked success
    - **Validates: Requirements 4.2**

  - [ ]* 3.3 Write property test for failed API response retains theme and shows toast (Property 8)
    - **Property 8: Failed API response retains applied theme and shows error**
    - Generator: `fc.constantFrom('light', 'dark', 'system')` with mocked failure
    - **Validates: Requirements 4.3**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Wire ThemeProvider into the app and deprecate DashboardContext theme fields
  - Wrap `AuthProvider` with `ThemeProvider` in `src/App.tsx` (or root entry point)
  - Remove `theme` field and `toggleTheme` from `DashboardContext`; replace all `useDashboard()` theme references with `useTheme()`
  - _Requirements: 3.3, 4.4_

- [x] 6. Update ThemeToggle component
  - Update `src/components/dashboard/ThemeToggle.tsx` to consume `useTheme` instead of `useDashboard`
  - Render a three-option segmented control (Sun / Moon / Monitor icons) for `'light'`, `'dark'`, `'system'`
  - Highlight the currently active option
  - _Requirements: 3.1, 3.4, 3.5_

  - [ ]* 6.1 Write property test for ThemeToggle reflects active preference (Property 5)
    - **Property 5: ThemeToggle reflects active preference**
    - Generator: `fc.constantFrom('light', 'dark', 'system')`
    - Create `src/__tests__/ThemeToggle.test.tsx`
    - **Validates: Requirements 3.4**

  - [ ]* 6.2 Write unit tests for ThemeToggle rendering
    - Test all three options render
    - Test active option is highlighted for each preference value
    - **Validates: Requirements 3.4, 3.5**

- [x] 7. Update AppearanceSettings component
  - Wire `src/components/settings/AppearanceSettings.tsx` Appearance section to call `useTheme().setTheme` instead of the settings hook
  - Ensure the three-option control matches the ThemeToggle UI pattern
  - _Requirements: 3.2, 3.4, 3.5_

- [x] 8. Audit and migrate hard-coded colors in existing components
  - Scan all `.tsx`/`.ts` files under `src/components/`, `src/pages/`, and `src/layouts/` for hard-coded hex, `rgb(...)`, and `hsl(...)` values
  - Replace each occurrence with the appropriate Tailwind token utility class
  - Covers: cards, modals/dialogs, form inputs, charts, code blocks, navigation sidebar, top bar, bottom tab bar, notification banners, and toasts
  - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 8.1 Write property test for no hard-coded colors in component files (Property 1)
    - **Property 1: No hard-coded colors in component files**
    - Static file scan asserting no hex/rgb/hsl patterns in `src/components/`, `src/pages/`, `src/layouts/`
    - Add to `src/__tests__/theme.tokens.test.ts`
    - **Validates: Requirements 1.4**

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with a minimum of 100 iterations each
- Tag each property test with `// Feature: dark-mode-theme-support, Property N: <property text>`
- `ThemeProvider` must apply the `.dark` class synchronously on mount to prevent flash of wrong theme
- `localStorage` key for theme preference is `mm_theme_preference`
