# Mobile Components Structure

## 📁 Directory Structure

```
src/
├── components/
│   └── mobile/
│       ├── MobileNavigation.tsx      # Navigation components
│       ├── MobileModal.tsx           # Modal components
│       ├── TouchGestures.tsx         # Touch gesture handling
│       ├── PullToRefresh.tsx         # Pull-to-refresh
│       ├── MobileForm.tsx            # Form components
│       ├── MobileLoading.tsx         # Loading states
│       └── ResponsiveImage.tsx       # Image components
├── hooks/
│   └── useMobile.ts                  # Mobile detection hooks
├── utils/
│   └── responsive.utils.ts           # Responsive utilities
├── pages/
│   └── MobileDemo.tsx                # Demo page
└── __tests__/
    └── Mobile.test.tsx               # Component tests
```

## 🧩 Component Hierarchy

### Navigation Family
```
MobileNavigation (Bottom Tab Bar)
├── NavItem (with badge support)
└── Active indicator

MobileHeader (Top Header)
├── Back button
├── Title
├── Menu button
└── Right action slot

MobileTabBar (Content Tabs)
├── Tab items
├── Count badges
└── Active indicator
```

### Modal Family
```
MobileModal (Base Modal)
├── Overlay with backdrop blur
├── Modal container (3 positions)
│   ├── Bottom (slides up)
│   ├── Center (fades in)
│   └── Full (full screen)
├── Header (optional)
│   ├── Title
│   └── Close button
└── Content area

BottomSheet (extends MobileModal)
└── Fixed bottom position

FullScreenModal (extends MobileModal)
└── Full screen position

ActionSheet
├── Title (optional)
├── Action buttons
│   ├── Default variant
│   ├── Danger variant
│   └── Primary variant
└── Cancel button
```

### Touch & Gesture Family
```
TouchGestures (Component wrapper)
├── Swipe detection
│   ├── Left
│   ├── Right
│   ├── Up
│   └── Down
├── Tap detection
│   ├── Single tap
│   └── Double tap
└── Long press

useTouchGestures (Hook variant)
└── Same gesture detection

PullToRefresh
├── Pull indicator
│   ├── Icon with rotation
│   └── Progress feedback
└── Content wrapper

SimplePullToRefresh
└── Simplified refresh button
```

### Form Family
```
MobileForm (Form wrapper)
└── Form submission handling

MobileInput
├── Label (with required indicator)
├── Input field
│   ├── Icon support
│   └── Touch-optimized sizing
├── Error message (with icon)
└── Helper text

MobileTextarea
├── Label
├── Textarea field
├── Error message
└── Helper text

MobileSelect
├── Label
├── Native select
├── Error message
└── Helper text

MobileButton
├── Variants
│   ├── Primary
│   ├── Secondary
│   ├── Outline
│   └── Ghost
├── Sizes (sm, md, lg)
├── Loading state
├── Icon support
└── Full width option
```

### Loading Family
```
MobileLoading
├── Spinner
├── Text (optional)
└── Fullscreen option

Skeleton
├── Text variant
├── Circular variant
└── Rectangular variant

CardSkeleton
└── Multiple card placeholders

ListSkeleton
└── Multiple list item placeholders

Spinner
├── Size variants
└── Color variants

ProgressBar
├── Value/max
├── Label (optional)
├── Size variants
└── Color variants

PulseLoader
└── Animated dots
```

### Image Family
```
ResponsiveImage
├── Image element
├── Aspect ratio support
│   ├── 1:1 (square)
│   ├── 16:9 (video)
│   ├── 4:3
│   └── 3:2
├── Object fit options
├── Lazy loading
├── Placeholder
├── Loading state
└── Error fallback

Avatar
├── Image (if available)
├── Fallback to initials
├── Size variants
│   ├── xs
│   ├── sm
│   ├── md
│   ├── lg
│   └── xl
└── Error handling

ImageGallery
├── Grid layout
├── Image items
└── Fullscreen viewer
    ├── Current image
    ├── Navigation buttons
    ├── Close button
    └── Caption (optional)
```

## 🔗 Component Dependencies

### External Dependencies
```
lucide-react
├── Icons for navigation
├── Icons for actions
└── Icons for feedback
```

### Internal Dependencies
```
useMobile hook
├── Used by: MobileNavigation, MobileHeader, MobileModal
└── Provides: Device detection, breakpoint info

responsive.utils
├── Used by: useMobile, ResponsiveImage
└── Provides: Breakpoint detection, device info

TouchGestures
├── Used by: Swipeable components
└── Provides: Gesture detection
```

## 🎨 Styling Architecture

### Tailwind Classes
```
Base Styles
├── Mobile-first breakpoints (xs, sm, md, lg, xl, 2xl)
├── Safe area utilities (safe-area-top, safe-area-bottom)
├── Touch utilities (tap-target, no-select)
└── Scroll utilities (scrollbar-hide, momentum-scroll)

Component Styles
├── Consistent spacing (p-4, gap-3)
├── Rounded corners (rounded-xl, rounded-2xl)
├── Shadows (shadow-sm)
├── Transitions (transition-colors, transition-transform)
└── Animations (animate-spin, animate-pulse)
```

### CSS Custom Properties
```
Safe Area Insets
├── --safe-area-inset-top
├── --safe-area-inset-bottom
├── --safe-area-inset-left
└── --safe-area-inset-right

Color Tokens
├── Primary colors (50-900)
├── Stellar colors (light, default, dark)
└── Semantic colors (success, warning, danger)
```

## 🔄 Data Flow

### State Management
```
Component State (useState)
├── Modal open/close
├── Form values
├── Loading states
└── Active selections

Hook State (useMobile)
├── Device type
├── Breakpoint
├── Orientation
└── Online status

Event Handlers
├── Touch events
├── Form submissions
├── Navigation changes
└── Modal interactions
```

### Props Flow
```
Parent Component
├── Configuration props
│   ├── Variants
│   ├── Sizes
│   └── Options
├── Content props
│   ├── Children
│   ├── Labels
│   └── Icons
├── Event handlers
│   ├── onClick
│   ├── onSubmit
│   └── onChange
└── State props
    ├── isOpen
    ├── isLoading
    └── activeItem
```

## 🧪 Testing Structure

### Test Organization
```
Mobile.test.tsx
├── Navigation Tests
│   ├── MobileNavigation
│   ├── MobileHeader
│   └── MobileTabBar
├── Modal Tests
│   ├── MobileModal
│   ├── BottomSheet
│   └── ActionSheet
├── Gesture Tests
│   ├── TouchGestures
│   └── PullToRefresh
├── Form Tests
│   ├── MobileInput
│   ├── MobileButton
│   └── Form validation
├── Loading Tests
│   ├── MobileLoading
│   └── Skeleton variants
└── Image Tests
    ├── ResponsiveImage
    └── Avatar
```

### Test Patterns
```
Rendering Tests
├── Component renders correctly
├── Props are applied
└── Children are rendered

Interaction Tests
├── Click handlers work
├── Touch gestures detected
└── Form submissions

State Tests
├── State updates correctly
├── Conditional rendering
└── Loading states

Accessibility Tests
├── ARIA labels present
├── Keyboard navigation
└── Screen reader support
```

## 📊 Component Metrics

### Complexity
```
Simple Components (< 100 lines)
├── Skeleton
├── Spinner
├── Avatar
└── ProgressBar

Medium Components (100-300 lines)
├── MobileInput
├── MobileButton
├── MobileHeader
└── ResponsiveImage

Complex Components (> 300 lines)
├── MobileModal
├── TouchGestures
├── PullToRefresh
└── ImageGallery
```

### Reusability
```
High Reusability
├── MobileButton (used everywhere)
├── MobileInput (all forms)
├── Avatar (user displays)
└── Skeleton (loading states)

Medium Reusability
├── MobileModal (dialogs)
├── TouchGestures (interactive content)
└── ResponsiveImage (media)

Specialized
├── MobileNavigation (app shell)
├── PullToRefresh (lists)
└── ActionSheet (menus)
```

## 🎯 Usage Patterns

### Common Combinations
```
Mobile App Shell
├── MobileHeader
├── Content area
│   └── PullToRefresh
│       └── Content
└── MobileNavigation

Form Page
├── MobileHeader
├── MobileForm
│   ├── MobileInput (multiple)
│   └── MobileButton
└── MobileModal (for confirmation)

List Page
├── MobileHeader
├── MobileTabBar
├── PullToRefresh
│   └── List items
│       └── TouchGestures (swipe actions)
└── MobileNavigation

Profile Page
├── MobileHeader
├── Avatar
├── ResponsiveImage (cover)
├── Content sections
└── ActionSheet (options menu)
```

## 🔧 Customization Points

### Theme Customization
```
Colors
├── Primary palette
├── Stellar colors
└── Semantic colors

Typography
├── Font family
├── Font sizes
└── Line heights

Spacing
├── Padding scale
├── Margin scale
└── Gap scale

Borders
├── Border radius
├── Border width
└── Border colors
```

### Component Customization
```
Props
├── Variant props
├── Size props
└── Style props

Class Names
├── className prop
└── Tailwind utilities

Children
├── Render props
├── Slot props
└── Custom content
```

## 📚 Import Patterns

### Individual Imports
```typescript
import { MobileButton } from './components/mobile/MobileForm';
import { useMobile } from './hooks/useMobile';
```

### Grouped Imports
```typescript
import {
  MobileNavigation,
  MobileHeader,
  MobileTabBar
} from './components/mobile/MobileNavigation';
```

### Utility Imports
```typescript
import {
  isMobile,
  getCurrentBreakpoint,
  debounce
} from './utils/responsive.utils';
```

This structure provides a clear overview of how all mobile components are organized and how they relate to each other.
