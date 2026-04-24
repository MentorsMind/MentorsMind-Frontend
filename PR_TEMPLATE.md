# Pull Request: Issues Resolution

## Description

This PR resolves three critical issues in the authentication and API client systems:

1. **#201** - API retry counter only allows 2 retries instead of 3
2. **#196** - Token storage keys inconsistency between AuthContext and app.config
3. **#203** - AuthContext lacks standardized error state management

## Fixes

Closes #201
Closes #196
Closes #203

## Changes

### Issue #201: Fix Retry Counter Logic
**File:** `src/services/api.client.ts`

The retry counter was initialized to 0 (falsy), causing only 2 retries instead of the intended 3. The fix reorders the sleep and increment operations so the backoff delay uses the correct retry count (0, 1, 2), ensuring exactly 3 retries occur on 5xx errors.

**Before:**
```typescript
originalReq._retry++;
await sleep(getBackOffDelay(originalReq._retry));
```

**After:**
```typescript
await sleep(getBackOffDelay(originalReq._retry));
originalReq._retry++;
```

### Issue #196: Unify Token Storage Keys
**Files:** `src/contexts/AuthContext.tsx`, `src/components/auth/LoginForm.tsx`

The app had two different token storage key systems:
- `app.config.ts` exported `TOKEN_KEY = "accessToken"` and `REFRESH_TOKEN = "refreshToken"`
- `AuthContext.tsx` hardcoded `'mm_token'` and `'mm_refresh_token'`

This caused tokens to be written to different localStorage keys, preventing retrieval. The fix imports and uses the constants from `app.config.ts` everywhere.

**Changes:**
- Import `TOKEN_KEY` and `REFRESH_TOKEN` from `app.config.ts`
- Update `persistSession()` and `clearSession()` to use constants
- Update `LoginForm.tsx` passkey login to use constants
- Single source of truth for token storage keys

### Issue #203: Add Error State to AuthContext
**Files:** `src/contexts/AuthContext.tsx`, `src/components/auth/LoginForm.tsx`, `src/components/auth/RegisterForm.tsx`

Previously, login and register errors were thrown and caught individually by each component with no standardized format. This led to inconsistent error handling and UX.

**Changes:**
- Added `error: string | null` field to `AuthContextType`
- Added `clearError()` function to context
- Updated `login()` to catch errors and set error state
- Updated `register()` to catch errors and set error state
- Updated `LoginForm.tsx` to read `authError` from context
- Updated `RegisterForm.tsx` to read `authError` from context
- Consistent error handling across all auth components

## Type of Change

- [x] Bug fix (non-breaking change which fixes an issue)
- [x] Enhancement (non-breaking change which adds functionality)

## Testing

- [x] TypeScript diagnostics pass (no errors)
- [x] All modified files compile without errors
- [x] Code follows existing patterns and conventions

## Checklist

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] My changes generate no new warnings
- [x] I have made corresponding changes to the documentation (if applicable)

## Related Issues

- Fixes #201
- Fixes #196
- Fixes #203
