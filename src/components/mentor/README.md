# Mentor Dashboard Components

This directory contains all components related to mentor profile setup and availability management.

## Profile Setup Components

### PhotoUpload
Drag-and-drop photo upload component with preview functionality.
```tsx
<PhotoUpload 
  currentPhoto={photoUrl} 
  onPhotoChange={(url) => setPhotoUrl(url)} 
/>
```

### SkillTagSelector
Tag-based skill selection with autocomplete suggestions.
```tsx
<SkillTagSelector
  selectedSkills={skills}
  onChange={(skills) => setSkills(skills)}
  label="Skills & Expertise"
/>
```

### PortfolioSection
Manage portfolio items (projects, certifications, achievements).
```tsx
<PortfolioSection
  items={portfolio}
  onAdd={(item) => addItem(item)}
  onRemove={(id) => removeItem(id)}
/>
```

### ProfileForm
Complete profile form with all mentor information fields.
```tsx
<ProfileForm
  profile={profile}
  onUpdate={(updates) => updateProfile(updates)}
  onAddPortfolio={addPortfolioItem}
  onRemovePortfolio={removePortfolioItem}
/>
```

### ProfilePreview
Modal preview of how the profile appears to learners.
```tsx
<ProfilePreview 
  profile={profile} 
  onClose={() => setShowPreview(false)} 
/>
```

## Availability Components

### AvailabilityCalendar
Week view calendar with drag-and-drop time slot editing.
```tsx
<AvailabilityCalendar
  timeSlots={slots}
  onSlotClick={(slot) => handleSlotClick(slot)}
  onDeleteSlot={(id) => deleteSlot(id)}
  onSlotUpdate={(id, updates) => updateSlot(id, updates)}
/>
```

### TimeSlotEditor
Modal for creating and editing time slots with recurring patterns.
```tsx
<TimeSlotEditor
  onAdd={(slot) => addSlot(slot)}
  onClose={() => setShowEditor(false)}
/>
```

### TimezoneSelector
Timezone picker with auto-detection.
```tsx
<TimezoneSelector
  value={timezone}
  onChange={(tz) => setTimezone(tz)}
/>
```

### RecurringAvailability
Set recurring availability patterns (daily/weekly/monthly).
```tsx
<RecurringAvailability
  onApply={(pattern, baseSlot) => applyPattern(pattern, baseSlot)}
/>
```

### CalendarSync
Calendar integration for Google, Outlook, and Apple calendars.
```tsx
<CalendarSync
  onSync={(provider) => syncCalendar(provider)}
  syncedCalendars={syncedCalendars}
/>
```

## Hooks

### useMentorProfile
Manages mentor profile state and operations.
```tsx
const {
  profile,
  loading,
  error,
  updateProfile,
  saveProfile,
  addPortfolioItem,
  removePortfolioItem,
} = useMentorProfile();
```

### useAvailability
Manages availability and time slot operations.
```tsx
const {
  timeSlots,
  timezone,
  loading,
  setTimezone,
  addTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  blockTimeRange,
  copyFromPreviousWeek,
  saveAvailability,
} = useAvailability();
```

## Utilities

### calendar.utils
Calendar-related utility functions:
- `formatTimeSlot(start, end)` - Format time slot display
- `convertTimezone(date, fromTz, toTz)` - Convert between timezones
- `detectTimezone()` - Auto-detect user timezone
- `isTimeSlotOverlapping(slot1, slot2)` - Check for overlaps
- `generateRecurringSlots(baseSlot, pattern)` - Generate recurring slots

## Usage Example

```tsx
import { MentorProfileSetup } from './pages/MentorProfileSetup';

function App() {
  return <MentorProfileSetup />;
}
```

The `MentorProfileSetup` page integrates all components into a multi-step wizard with:
- Profile information step
- Availability & scheduling step
- Progress tracking
- Save functionality
- Profile preview

## Features

✅ Drag-and-drop photo upload
✅ Tag-based skill selection
✅ Portfolio management
✅ Social links integration
✅ Profile completion tracking
✅ Profile verification status
✅ Visual calendar interface
✅ Drag-and-drop time slot editing
✅ Recurring availability patterns
✅ Multi-timezone support
✅ Calendar sync (Google/Outlook/Apple)
✅ Copy previous week
✅ Blocked time management
✅ Comprehensive test coverage
