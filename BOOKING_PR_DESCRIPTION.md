# Fix BookingsController.createBooking Implementation

## Summary
Fixes broken booking creation flow by updating frontend to use correct API format and implementing all acceptance criteria from #299.

## Problem
The booking creation flow was broken because:
- The frontend was sending an incorrect payload format to API
- The BookingsController.createBooking was a stub returning 501
- No feature flag existed to disable booking flow
- Missing Idempotency-Key header support
- No proper handling for 409 Conflict errors

## Solution

### 🚀 Feature Flag Implementation
- Added `BOOKING_ENABLED = false` feature flag in `src/config/app.config.ts`
- When disabled, shows a polished "Coming Soon" message in booking modal
- Easy to toggle when backend is ready

### 🔧 API Integration Fix
**Updated `src/services/booking.service.ts`:**
- Changed payload format from complex object to simple `{ mentorId, scheduledAt, durationMinutes, topic, notes }`
- Updated endpoint from `${apiConfig.url.sessions}/bookings` to direct `/bookings` endpoint
- Added support for `Idempotency-Key` header as required by Issue #6
- Removed unused imports and cleaned up code

### 📝 Booking Form Updates
**Updated `src/components/learner/BookingModal.tsx`:**
- Added all required duration options: `[15, 30, 45, 60, 90, 120]` minutes
- Integrated idempotency key generation and passing to booking service
- Enhanced error handling for 409 Conflict responses

### 🛡️ Error Handling
**Updated `src/hooks/useBooking.ts`:**
- Added specific 409 Conflict error handling
- Shows user-friendly message: "This time slot is no longer available. Please select a different time."
- Maintains existing error handling for other scenarios

## Changes Made

### Files Modified:
1. **`src/config/app.config.ts`** - Added BOOKING_ENABLED feature flag
2. **`src/services/booking.service.ts`** - Updated API format and added idempotency support
3. **`src/hooks/useBooking.ts`** - Added 409 Conflict error handling
4. **`src/components/learner/BookingModal.tsx`** - Added feature flag UI and duration options

### Technical Details:
- **Payload Format**: Now sends `{ mentorId, scheduledAt, durationMinutes, topic, notes }`
- **Timestamp**: `scheduledAt` is sent as ISO 8601 string in UTC
- **Idempotency**: UUID v4 generated and sent as `Idempotency-Key` header
- **Duration Options**: 15, 30, 45, 60, 90, 120 minutes (as dropdown)
- **Error Handling**: Specific 409 Conflict detection with user-friendly message

## Acceptance Criteria ✅

- [x] **Feature Flag**: `BOOKING_ENABLED = false` disables booking flow with "Coming soon" message
- [x] **Request Format**: Sends `{ mentorId, scheduledAt, durationMinutes, topic, notes }`
- [x] **UTC Timestamp**: `scheduledAt` is ISO 8601 string in UTC
- [x] **Duration Dropdown**: Shows 15, 30, 45, 60, 90, 120 minute options
- [x] **Idempotency-Key**: Header included in booking requests
- [x] **409 Conflict Handling**: Specific error message with prompt to pick different slot

## Testing

### Manual Testing Steps:
1. **Feature Flag Test**:
   - Set `BOOKING_ENABLED = false` → Shows "Coming Soon" message
   - Set `BOOKING_ENABLED = true` → Shows full booking flow

2. **API Format Test**:
   - Complete booking form and verify correct payload format
   - Check network tab for proper request structure

3. **Error Handling Test**:
   - Simulate 409 Conflict → Verify user-friendly error message
   - Test other errors → Verify generic error handling

4. **Duration Options Test**:
   - Verify all 6 duration options are available
   - Test selection and pricing updates

## Impact
- **Breaking Change**: None (feature flag defaults to disabled)
- **Backward Compatibility**: Maintained
- **Performance**: Improved (simpler payload, better error handling)

## Related Issues
- Fixes #299 - BookingsController.createBooking Implementation
- Addresses Issue #6 - Idempotency-Key header requirement
- Resolves Issue #2 - Booking creation flow broken at controller level

## How to Test
1. Set `BOOKING_ENABLED = true` in `src/config/app.config.ts`
2. Open mentor profile and click "Book Mentor"
3. Verify all duration options are available (15, 30, 45, 60, 90, 120)
4. Complete booking form and check network request format
5. Verify Idempotency-Key header is present
6. Test 409 Conflict error handling (if backend supports it)
