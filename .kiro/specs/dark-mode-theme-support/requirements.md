# Requirements Document

## Introduction

This feature adds dark mode and a theme token system to the MentorsMind frontend platform. Users can toggle between light and dark themes via the user menu or account settings. The system auto-detects the OS-level preference on first visit and persists the user's choice to their profile via the backend API so the preference syncs across devices. All UI components adopt the active theme through CSS custom properties — no hard-coded color values are permitted. Theme transitions are animated at 200ms and all color combinations meet WCAG AA contrast ratios.

## Glossary

- **Theme_System**: The set of CSS custom properties, Tailwind configuration, and React context that controls the active color theme across the application.
- **Theme_Toggle**: The interactive control (button/switch) that switches between light and dark themes.
- **Theme_Preference**: The user's chosen theme value, one of `"light"`, `"dark"`, or `"system"`.
- **Preference_Service**: The frontend service layer responsible for reading and writing theme preferences via `PUT /users/me`.
- **Theme_Context**: The React context that exposes the active theme and the toggle function to all components.
- **Token**: A named CSS custom property (e.g. `--color-background`) that maps to a concrete color value for the active theme.
- **System_Preference**: The OS/browser color scheme reported by the `prefers-color-scheme` media query.
- **WCAG_AA**: The Web Content Accessibility Guidelines 2.1 Level AA contrast ratio standard (minimum 4.5:1 for normal text, 3:1 for large text).

## Requirements

### Requirement 1: Theme Token System

**User Story:** As a developer, I want all colors defined as CSS custom properties, so that switching themes requires only a single class change on the root element and no component-level color overrides.

#### Acceptance Criteria

1. THE Theme_System SHALL define every UI color as a named CSS custom property Token on the `:root` selector for the light theme and on the `.dark` selector for the dark theme.
2. THE Theme_System SHALL expose Tokens for at minimum: background, surface, border, primary, primary-foreground, secondary, secondary-foreground, muted, muted-foreground, accent, accent-foreground, destructive, destructive-foreground, and text.
3. THE Theme_System SHALL configure Tailwind CSS to reference these Tokens via `theme.extend.colors` so that Tailwind utility classes resolve to the active Token values.
4. IF a component references a hard-coded hex, rgb, or hsl color value outside of the Token definitions, THEN THE Theme_System SHALL be considered non-compliant and the value MUST be replaced with the appropriate Token.

---

### Requirement 2: System Preference Auto-Detection

**User Story:** As a new user, I want the platform to respect my OS color scheme on first visit, so that I don't have to manually configure the theme.

#### Acceptance Criteria

1. WHEN a user visits the platform for the first time and no stored Theme_Preference exists, THE Theme_System SHALL read the System_Preference via the `prefers-color-scheme` media query and apply the matching theme.
2. WHEN the System_Preference is `dark` and no stored Theme_Preference exists, THE Theme_System SHALL apply the dark theme.
3. WHEN the System_Preference is `light` and no stored Theme_Preference exists, THE Theme_System SHALL apply the light theme.
4. WHEN the System_Preference changes at runtime (e.g. the user switches OS theme) and the stored Theme_Preference is `"system"`, THE Theme_System SHALL update the active theme to match the new System_Preference without requiring a page reload.

---

### Requirement 3: Theme Toggle Controls

**User Story:** As a user, I want to switch between light and dark themes from the navigation menu and from my account settings, so that I can change my preference from wherever I am in the app.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL be present in the user dropdown menu in the top navigation bar.
2. THE Theme_Toggle SHALL be present on the Account Settings page within a dedicated "Appearance" section.
3. WHEN a user activates the Theme_Toggle, THE Theme_System SHALL switch the active theme immediately without a page reload.
4. THE Theme_Toggle SHALL display the currently active theme so the user can identify which theme is selected.
5. THE Theme_Toggle SHALL offer three options: `"light"`, `"dark"`, and `"system"` (follow OS preference).

---

### Requirement 4: Theme Persistence via Backend API

**User Story:** As a logged-in user, I want my theme preference saved to my profile, so that my chosen theme is applied automatically when I log in from any device.

#### Acceptance Criteria

1. WHEN a logged-in user changes the Theme_Preference, THE Preference_Service SHALL send a `PUT /users/me` request with the updated `theme_preference` field within 500ms of the change.
2. WHEN the `PUT /users/me` request succeeds, THE Theme_Context SHALL retain the new Theme_Preference as the persisted value.
3. IF the `PUT /users/me` request fails, THEN THE Theme_System SHALL retain the locally applied theme and display a non-blocking error notification informing the user that the preference could not be saved.
4. WHEN a logged-in user loads the application, THE Theme_System SHALL apply the Theme_Preference returned in the user profile response before the first paint to avoid a flash of the wrong theme.
5. WHEN a user is not logged in, THE Theme_System SHALL store the Theme_Preference in `localStorage` and apply it on subsequent visits.

---

### Requirement 5: Dark Mode Variants for All UI Components

**User Story:** As a user, I want every part of the interface to look correct in dark mode, so that I never encounter components that are unreadable or visually broken when the dark theme is active.

#### Acceptance Criteria

1. WHILE the dark theme is active, THE Theme_System SHALL apply dark-mode Token values to all card components so that backgrounds, borders, and text remain legible.
2. WHILE the dark theme is active, THE Theme_System SHALL apply dark-mode Token values to all modal and dialog components.
3. WHILE the dark theme is active, THE Theme_System SHALL apply dark-mode Token values to all form inputs, labels, placeholders, and validation messages.
4. WHILE the dark theme is active, THE Theme_System SHALL apply dark-mode Token values to all chart components so that axes, labels, grid lines, and data series remain distinguishable.
5. WHILE the dark theme is active, THE Theme_System SHALL apply a dark-mode syntax highlighting theme to all code block components.
6. WHILE the dark theme is active, THE Theme_System SHALL apply dark-mode Token values to the navigation sidebar, top bar, and bottom tab bar.
7. WHILE the dark theme is active, THE Theme_System SHALL apply dark-mode Token values to notification banners and toast messages.

---

### Requirement 6: Theme Transition Animation

**User Story:** As a user, I want the theme switch to feel smooth rather than jarring, so that the visual change is comfortable to watch.

#### Acceptance Criteria

1. WHEN the active theme changes, THE Theme_System SHALL apply a CSS transition of exactly 200ms to `background-color`, `color`, and `border-color` properties on the root element and all themed components.
2. WHEN a user has enabled the `prefers-reduced-motion` media query, THE Theme_System SHALL disable the 200ms transition and apply the theme change instantly.

---

### Requirement 7: WCAG AA Contrast Compliance

**User Story:** As a user with visual impairments, I want both themes to meet accessibility contrast standards, so that text and interactive elements are always readable.

#### Acceptance Criteria

1. THE Theme_System SHALL define dark-theme Token values such that all normal-sized text achieves a minimum contrast ratio of 4.5:1 against its background Token.
2. THE Theme_System SHALL define dark-theme Token values such that all large text (18pt or 14pt bold) achieves a minimum contrast ratio of 3:1 against its background Token.
3. THE Theme_System SHALL define dark-theme Token values such that all interactive UI components (buttons, links, form controls) achieve a minimum contrast ratio of 3:1 against adjacent colors.
4. THE Theme_System SHALL define light-theme Token values that satisfy the same contrast ratio requirements stated in criteria 1, 2, and 3.
