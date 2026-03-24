# Mobile Components - Sample Output & Visual Guide

## 🎨 Component Visual Examples

### 1. MobileNavigation (Bottom Tab Bar)
```
┌─────────────────────────────────────────┐
│                                         │
│           Page Content Here             │
│                                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  🏠      🔍      🔔(3)     👤          │
│ Home   Search   Alerts   Profile        │
│  ━━                                     │
└─────────────────────────────────────────┘
```

**Features:**
- Active indicator (━━) under selected item
- Badge (3) on notifications
- Touch-optimized spacing
- Safe area padding

### 2. MobileHeader
```
┌─────────────────────────────────────────┐
│ ← Menu    Page Title         ⚙️         │
└─────────────────────────────────────────┘
```

**Features:**
- Back/Menu button on left
- Centered title with truncation
- Custom action on right
- Sticky positioning

### 3. MobileModal (Bottom Sheet)
```
┌─────────────────────────────────────────┐
│                                         │
│         Backdrop (blurred)              │
│                                         │
│  ╭─────────────────────────────────╮   │
│  │  Modal Title              ✕     │   │
│  ├─────────────────────────────────┤   │
│  │                                 │   │
│  │  Modal content goes here        │   │
│  │                                 │   │
│  │  [Primary Button]               │   │
│  │                                 │   │
│  ╰─────────────────────────────────╯   │
└─────────────────────────────────────────┘
```

**Variants:**
- Bottom: Slides up from bottom
- Center: Fades in at center
- Full: Takes full screen

### 4. ActionSheet
```
┌─────────────────────────────────────────┐
│                                         │
│         Backdrop (blurred)              │
│                                         │
│  ╭─────────────────────────────────╮   │
│  │     Choose an action            │   │
│  ├─────────────────────────────────┤   │
│  │  📤  Share                      │   │
│  │  ⚙️   Settings                  │   │
│  │  🗑️   Delete (red)              │   │
│  ├─────────────────────────────────┤   │
│  │  Cancel                         │   │
│  ╰─────────────────────────────────╯   │
└─────────────────────────────────────────┘
```

### 5. TouchGestures Visual Feedback
```
Swipe Left:  ←←←  [Content] 
Swipe Right: [Content]  →→→
Swipe Up:    [Content]  ↑↑↑
Swipe Down:  ↓↓↓  [Content]

Tap:         [Content] •
Double Tap:  [Content] ••
Long Press:  [Content] ⊙ (hold)
```

### 6. PullToRefresh
```
State 1: Normal
┌─────────────────────────────────────────┐
│  Content Item 1                         │
│  Content Item 2                         │
│  Content Item 3                         │
└─────────────────────────────────────────┘

State 2: Pulling
┌─────────────────────────────────────────┐
│         ↻ (rotating)                    │
│  ─────────────────────                  │
│  Content Item 1                         │
│  Content Item 2                         │
└─────────────────────────────────────────┘

State 3: Refreshing
┌─────────────────────────────────────────┐
│         ⟳ (spinning)                    │
│  ─────────────────────                  │
│  Loading new content...                 │
└─────────────────────────────────────────┘
```

### 7. MobileForm Components
```
┌─────────────────────────────────────────┐
│  Name *                                 │
│  ┌───────────────────────────────────┐ │
│  │ John Doe                          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Email *                                │
│  ┌───────────────────────────────────┐ │
│  │ 📧 john@example.com               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Message *                              │
│  ┌───────────────────────────────────┐ │
│  │ Your message here...              │ │
│  │                                   │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │        Submit Form                │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**With Error:**
```
┌─────────────────────────────────────────┐
│  Email *                                │
│  ┌───────────────────────────────────┐ │
│  │ invalid-email                     │ │ (red border)
│  └───────────────────────────────────┘ │
│  ⚠️  Please enter a valid email        │ (red text)
└─────────────────────────────────────────┘
```

### 8. MobileButton Variants
```
Primary:    ┌─────────────────┐
            │  Primary Button │ (blue bg, white text)
            └─────────────────┘

Secondary:  ┌─────────────────┐
            │ Secondary Button│ (gray bg, white text)
            └─────────────────┘

Outline:    ┌─────────────────┐
            │  Outline Button │ (blue border, blue text)
            └─────────────────┘

Ghost:      ┌─────────────────┐
            │   Ghost Button  │ (transparent, blue text)
            └─────────────────┘

Loading:    ┌─────────────────┐
            │  ⟳ Loading...   │ (spinner + text)
            └─────────────────┘
```

### 9. Loading States
```
MobileLoading:
┌─────────────────────────────────────────┐
│                                         │
│              ⟳                          │
│         Loading data...                 │
│                                         │
└─────────────────────────────────────────┘

Skeleton:
┌─────────────────────────────────────────┐
│  ⚪ ▓▓▓▓▓▓▓▓▓▓▓▓                       │
│     ▓▓▓▓▓▓▓▓                           │
│                                         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓             │
└─────────────────────────────────────────┘

Progress Bar:
┌─────────────────────────────────────────┐
│  Progress                          75%  │
│  ████████████████████░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────┘
```

### 10. Avatar Sizes
```
xs:  ⚪ (24px)
sm:  ⚪  (32px)
md:  ⚪   (40px)
lg:  ⚪    (48px)
xl:  ⚪     (64px)

With Initials:
┌────┐
│ JD │ (if no image)
└────┘
```

### 11. ResponsiveImage
```
Loading:
┌─────────────────────────────────────────┐
│                                         │
│              ⟳                          │
│                                         │
└─────────────────────────────────────────┘

Loaded:
┌─────────────────────────────────────────┐
│                                         │
│         [Image Content]                 │
│                                         │
└─────────────────────────────────────────┘

Error:
┌─────────────────────────────────────────┐
│                                         │
│              🖼️                         │
│                                         │
└─────────────────────────────────────────┘
```

### 12. MobileTabBar
```
┌─────────────────────────────────────────┐
│  All (24)   Active (8)   Completed (16) │
│  ━━━━━                                  │
└─────────────────────────────────────────┘
```

## 📱 Responsive Breakpoints

### Extra Small (xs: 320px)
```
┌──────────┐
│  Mobile  │
│  Phone   │
│  View    │
└──────────┘
```

### Small (sm: 640px)
```
┌────────────────┐
│  Large Phone   │
│  or Small      │
│  Tablet View   │
└────────────────┘
```

### Medium (md: 768px)
```
┌──────────────────────┐
│   Tablet Portrait    │
│   View               │
└──────────────────────┘
```

### Large (lg: 1024px)
```
┌────────────────────────────┐
│   Tablet Landscape or      │
│   Small Desktop View       │
└────────────────────────────┘
```

### Extra Large (xl: 1280px)
```
┌──────────────────────────────────┐
│   Desktop View                   │
└──────────────────────────────────┘
```

### 2XL (2xl: 1536px)
```
┌────────────────────────────────────────┐
│   Large Desktop View                   │
└────────────────────────────────────────┘
```

## 🎯 Touch Target Sizes

### Minimum Touch Target (44px)
```
┌──────────────┐
│              │  44px height
│    Button    │  minimum
│              │
└──────────────┘
```

### Recommended Touch Target (48px)
```
┌──────────────┐
│              │  48px height
│    Button    │  recommended
│              │
└──────────────┘
```

## 🔄 Animation States

### Slide In (Bottom Sheet)
```
Frame 1:  ┌─────┐
          │     │
          └─────┘
          ▼▼▼▼▼

Frame 2:  ┌─────┐
          │     │
          ▼▼▼
          └─────┘

Frame 3:  ┌─────┐
          ▼
          │     │
          └─────┘

Frame 4:  ┌─────┐
          │     │
          └─────┘
```

### Fade In (Center Modal)
```
Frame 1:  ░░░░░  (0% opacity)
Frame 2:  ▒▒▒▒▒  (33% opacity)
Frame 3:  ▓▓▓▓▓  (66% opacity)
Frame 4:  █████  (100% opacity)
```

### Spin (Loading)
```
Frame 1:  ◐
Frame 2:  ◓
Frame 3:  ◑
Frame 4:  ◒
```

## 📊 Component State Examples

### Button States
```
Default:   [  Button  ]
Hover:     [  Button  ] (darker)
Active:    [  Button  ] (darkest)
Disabled:  [  Button  ] (grayed, 50% opacity)
Loading:   [ ⟳ Loading... ]
```

### Input States
```
Default:   ┌──────────┐
           │          │
           └──────────┘

Focus:     ┌──────────┐ (blue border, ring)
           │ |        │
           └──────────┘

Error:     ┌──────────┐ (red border)
           │          │
           └──────────┘
           ⚠️ Error message

Disabled:  ┌──────────┐ (gray, 50% opacity)
           │          │
           └──────────┘
```

### Modal States
```
Closed:    (not visible)

Opening:   ░░░░░░░░░░  (animating in)
           ░ Modal ░
           ░░░░░░░░░░

Open:      ██████████  (fully visible)
           █ Modal █
           ██████████

Closing:   ▒▒▒▒▒▒▒▒▒▒  (animating out)
           ▒ Modal ▒
           ▒▒▒▒▒▒▒▒▒▒
```

## 🎨 Color Scheme

### Primary Colors
```
50:  ░░░░░  #f0f9ff (lightest)
100: ░░░░   #e0f2fe
200: ░░░    #bae6fd
300: ░░     #7dd3fc
400: ░      #38bdf8
500: █      #0ea5e9 (base)
600: ██     #0284c7
700: ███    #0369a1
800: ████   #075985
900: █████  #0c4a6e (darkest)
```

### Stellar Colors
```
Light:   ░  #7B61FF
Default: █  #5B3FFF
Dark:    ██ #3B1FDF
```

### Semantic Colors
```
Success: 🟢 Green
Warning: 🟡 Yellow
Danger:  🔴 Red
Info:    🔵 Blue
```

## 📐 Spacing Scale

```
0:   •
1:   •─
2:   •──
3:   •───
4:   •────
5:   •─────
6:   •──────
8:   •────────
10:  •──────────
12:  •────────────
16:  •────────────────
20:  •────────────────────
```

## 🔤 Typography Scale

```
xs:   Text (12px)
sm:   Text (14px)
base: Text (16px)
lg:   Text (18px)
xl:   Text (20px)
2xl:  Text (24px)
3xl:  Text (30px)
4xl:  Text (36px)
```

## 🎭 Real-World Usage Example

### Complete Mobile Page
```
┌─────────────────────────────────────────┐
│ ← Menu    Dashboard         ⚙️          │ ← MobileHeader
├─────────────────────────────────────────┤
│  All (24)   Active (8)   Done (16)      │ ← MobileTabBar
│  ━━━━━                                  │
├─────────────────────────────────────────┤
│  ↓ Pull to refresh                      │ ← PullToRefresh
│                                         │
│  ╭─────────────────────────────────╮   │
│  │ ⚪ Task Title                   │   │ ← Card
│  │    Description here...          │   │
│  │    [View Details]               │   │
│  ╰─────────────────────────────────╯   │
│                                         │
│  ╭─────────────────────────────────╮   │
│  │ ⚪ Another Task                 │   │
│  │    More details...              │   │
│  │    [View Details]               │   │
│  ╰─────────────────────────────────╯   │
│                                         │
├─────────────────────────────────────────┤
│  🏠      🔍      🔔(3)     👤          │ ← MobileNavigation
│ Home   Search   Alerts   Profile        │
│  ━━                                     │
└─────────────────────────────────────────┘
```

This visual guide helps developers understand what each component looks like and how they work together in a mobile interface.
