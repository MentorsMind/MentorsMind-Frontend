# Persistent Onboarding Checklist Implementation Guide

## 📋 Overview

This guide documents the implementation of a persistent, role-based onboarding checklist widget for the MentorsMind platform. The system guides new users (< 30 days old) through key setup steps with automatic progress tracking, deep-linking, and a delightful UI/UX experience.

## 🏗️ Architecture

### Core Components

#### 1. **useOnboardingProgress Hook** (`src/hooks/useOnboardingProgress.ts`)
The central state management hook that handles all onboarding logic.

**Key Features:**
- Role-based checklist configuration (mentor vs learner)
- LocalStorage persistence
- Auto-completion detection
- New user identification (< 30 days)
- Progress calculation

**API:**
```typescript
const onboarding = useOnboardingProgress({
  role: 'mentor' | 'learner',
  userCreatedAt?: string,  // ISO date string
});

// State properties
onboarding.items                      // OnboardingItem[]
onboarding.completedCount             // number
onboarding.totalCount                 // number
onboarding.progressPercentage         // 0-100
onboarding.isDismissed                // boolean
onboarding.isCompleted                // boolean
onboarding.shouldDisplay              // boolean
onboarding.isNewUser                  // boolean
onboarding.lastUpdated                // ISO date string

// Methods
onboarding.markItemComplete(itemId)   // void
onboarding.markItemIncomplete(itemId) // void
onboarding.toggleItemCompletion(itemId) // void
onboarding.dismissWidget()            // void
onboarding.resumeWidget()             // void
onboarding.resetOnboarding()          // void
onboarding.autoDetectCompletion(userData) // void
```

#### 2. **OnboardingChecklist Component** (`src/components/onboarding/OnboardingChecklist.tsx`)
Main UI component rendering the checklist widget.

**Features:**
- Expandable/collapsible interface
- Visual progress bar with gradient colors
- Interactive checklist items with deep-links
- Celebration animation on completion
- Dismissal recovery banner
- Completion banner
- Accessibility support (ARIA, keyboard navigation)

**Props:**
```typescript
interface OnboardingChecklistProps {
  items: OnboardingItem[];
  progressPercentage: number;
  completedCount: number;
  totalCount: number;
  isDismissed: boolean;
  isCompleted: boolean;
  shouldDisplay: boolean;
  onMarkItemComplete: (itemId: string) => void;
  onDismiss: () => void;
  onResume: () => void;
  onReset?: () => void;
  role: 'mentor' | 'learner';
  userEmail?: string;
}
```

#### 3. **OnboardingProgressBar Component** (`src/components/onboarding/OnboardingProgressBar.tsx`)
Visual progress indicator with smooth animations.

**Features:**
- Dynamic color gradients based on progress
- Shimmer animation effect
- Accessibility: ARIA progressbar role
- Responsive and mobile-friendly

## 📦 Checklists

### Mentor Checklist
1. **Complete Profile** - Add bio, expertise, and profile photo
2. **Set Availability** - Define weekly schedule and time slots
3. **Connect Wallet** - Link Stellar wallet for payments
4. **Complete First Session** - Conduct first mentoring session

### Learner Checklist
1. **Complete Profile** - Set learning goals and preferences
2. **Find a Mentor** - Browse and select a matching mentor
3. **Book First Session** - Schedule first mentoring session
4. **Set Up Wallet** - Connect wallet for session payments

## 💾 Persistence Strategy

All progress is persisted to localStorage with the following keys:

```
Local Storage Keys (by role):
- onboarding_progress_{role}      → JSON array of completed item IDs
- onboarding_dismissed_{role}     → 'true' | 'false'
- onboarding_completed_{role}     → 'true' | 'false'

Example:
- onboarding_progress_mentor      → ["profile", "availability"]
- onboarding_dismissed_mentor     → "false"
- onboarding_completed_mentor     → "false"
```

## 🎯 Display Logic

The widget displays when ALL of the following are true:
1. User account age < 30 days
2. Widget is not dismissed
3. Onboarding is not completed

The widget automatically hides when:
- User is >= 30 days old
- User dismisses the widget
- All checklist items are completed

## 🔄 Auto-Detection System

The `autoDetectCompletion()` method can automatically mark items as complete based on user data:

```typescript
// Example usage in dashboard
onboarding.autoDetectCompletion({
  profileCompleted: userProfile.isComplete,
  walletConnected: userWallet.address !== null,
  availabilitySet: userAvailability.slots.length > 0,
  firstSessionCompleted: userSessions.completed.length > 0,
});
```

## 🎨 Styling & Animations

### CSS Files
- `OnboardingChecklist.css` - Main component animations and transitions
- `OnboardingProgressBar.css` - Progress bar animations

### Key Animations
- **slideInUp** - Component entrance
- **scaleIn** - Item completion animation
- **shimmer** - Progress bar visual effect
- **bounce** - Celebration toast animation
- **pulse** - Loading states

### Color Scheme
- **0-25%** - Red/Orange gradient
- **25-50%** - Orange/Amber gradient
- **50-75%** - Blue gradient
- **75-100%** - Emerald/Green gradient

### Accessibility
- Reduced motion support via `prefers-reduced-motion` media query
- All animations disabled for users with motion preferences
- ARIA roles and attributes for screen readers
- Keyboard navigation support (Enter, Space)

## 🔗 Deep-Linking

Each incomplete checklist item includes a deep-link button that navigates to the relevant setup page:

```typescript
// Routes configuration
mentor routes:
- Complete Profile      → /profile
- Set Availability      → /settings/availability
- Connect Wallet        → /wallet
- Complete First Session → /sessions

learner routes:
- Complete Profile      → /profile
- Find a Mentor         → /search
- Book First Session    → /sessions/book
- Set Up Wallet         → /wallet
```

## 📊 Integration Points

### MentorDashboard (`src/pages/MentorDashboard.tsx`)
```typescript
const onboarding = useOnboardingProgress({
  role: 'mentor',
  userCreatedAt: user?.createdAt,
});

// In JSX, before DashboardGrid:
{onboarding.shouldDisplay && (
  <OnboardingChecklist
    {...onboarding}
    onMarkItemComplete={onboarding.markItemComplete}
    onDismiss={onboarding.dismissWidget}
    onResume={onboarding.resumeWidget}
    onReset={onboarding.resetOnboarding}
    role="mentor"
    userEmail={user?.email}
  />
)}
```

### LearnerDashboard (`src/pages/LearnerDashboard.tsx`)
Similar integration with `role="learner"`.

## 🧪 Testing

### Unit Tests (`src/__tests__/useOnboardingProgress.test.ts`)
Comprehensive test coverage for the hook:
- Initialization and localStorage loading
- New user detection
- Item completion logic
- Progress calculation
- Auto-completion
- Dismissal and resumption
- Persistence

Run tests:
```bash
npm run test src/__tests__/useOnboardingProgress.test.ts
```

### Integration Tests (`src/__tests__/OnboardingChecklist.test.tsx`)
Component testing including:
- Rendering and visibility
- Item interaction
- Progress bar updates
- Collapse/expand functionality
- Dismissal behavior
- Accessibility features
- Role variations

Run tests:
```bash
npm run test src/__tests__/OnboardingChecklist.test.tsx
```

## 🚀 Usage Examples

### Basic Setup
```typescript
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import { useAuth } from '../hooks/useAuth';

export function YourDashboard() {
  const { user } = useAuth();
  const onboarding = useOnboardingProgress({
    role: user?.role ?? 'learner',
    userCreatedAt: user?.createdAt,
  });

  return (
    <div>
      {/* Show checklist for new users */}
      {onboarding.shouldDisplay && (
        <OnboardingChecklist
          items={onboarding.items}
          progressPercentage={onboarding.progressPercentage}
          completedCount={onboarding.completedCount}
          totalCount={onboarding.totalCount}
          isDismissed={onboarding.isDismissed}
          isCompleted={onboarding.isCompleted}
          shouldDisplay={onboarding.shouldDisplay}
          onMarkItemComplete={onboarding.markItemComplete}
          onDismiss={onboarding.dismissWidget}
          onResume={onboarding.resumeWidget}
          onReset={onboarding.resetOnboarding}
          role={user?.role === 'mentor' ? 'mentor' : 'learner'}
          userEmail={user?.email}
        />
      )}
    </div>
  );
}
```

### Auto-Detection Integration
```typescript
useEffect(() => {
  // Auto-detect completed items based on user profile
  onboarding.autoDetectCompletion({
    profileCompleted: Boolean(user?.bio && user?.avatar),
    walletConnected: Boolean(wallet?.address),
    availabilitySet: user?.role === 'mentor' && availability.slots.length > 0,
    mentorFound: user?.role === 'learner' && selectedMentor !== null,
  });
}, [user, wallet, availability]);
```

## 🔍 Edge Cases Handled

1. **Users switching roles** - Separate state per role
2. **Partial/inconsistent data** - Auto-detection validates before marking complete
3. **Already completed onboarding** - Widget hidden permanently
4. **Dismissed users** - Recovery banner shown with resume option
5. **localStorage unavailable** - Graceful fallback with warning logs
6. **Account age calculation** - Handles null/invalid dates
7. **Multiple dashboard visits** - State synced with localStorage

## 📈 Performance Optimizations

1. **Memoization** - Components wrapped with React.memo
2. **useMemo** - Derived values cached
3. **useCallback** - Event handlers memoized
4. **Lazy evaluation** - Calculations only when dependencies change
5. **localStorage debouncing** - Updates batched (1-minute cache duration)
6. **Minimal re-renders** - State updates batched when possible

## 🎯 Future Enhancements

1. **Backend Persistence** - Replace localStorage with API calls
2. **Analytics Integration** - Track completion rates, drop-off points
3. **Enhanced Animations** - Add confetti or particle effects
4. **Conditional Steps** - Show/hide steps based on user behavior
5. **Tooltips** - Add hover tooltips with guidance
6. **Multi-step wizards** - Navigate through setup flows
7. **Progress notifications** - Email/push notifications for encouragement
8. **A/B Testing** - Variations for optimization

## 🐛 Troubleshooting

### Widget not showing
- Check if user is < 30 days old: `onboarding.isNewUser`
- Check if dismissed: `onboarding.isDismissed`
- Check if completed: `onboarding.isCompleted`
- Verify `shouldDisplay` is true

### Progress not persisting
- Check browser localStorage is enabled
- Clear localStorage cache: `localStorage.clear()`
- Check for console errors
- Verify role is correct in hook params

### Items not auto-marking complete
- Ensure `autoDetectCompletion()` called after user data updates
- Verify user data matches expected structure
- Check item IDs match defined items

## 📝 Notes

- All timestamps are stored as ISO strings
- Role types must match 'mentor' or 'learner'
- localStorage keys are prefixed by role to avoid conflicts
- Animations respect user's motion preferences for accessibility
- Component uses Tailwind CSS for styling

## 🔐 Security Considerations

- All data stored in localStorage is client-side (no sensitive data)
- User creation dates are already available from User object
- No authentication tokens stored in onboarding state
- Deep-links validated against app router
- Ready for backend API integration in future
