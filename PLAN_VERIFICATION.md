# Plan: Verification Submission Requires Presigned URL Flow

## Problem

The current verification flow uploads file blobs directly via multipart form-data. The backend now expects:
1. Files are uploaded to S3/GCS via a **presigned URL** first.
2. The resulting public URL is passed to `POST /mentors/verification/submit` with shape:
   `{ documentType, documentUrl, credentialUrl, linkedinUrl, additionalNotes }`
3. The public `GET /mentors/:id/verification-status` strips sensitive fields (`rejection_reason`, `additional_info_request`, `reviewed_by`) — these are only visible via an authenticated endpoint.

## Files to Modify

### 1. `src/types/verification.types.ts`
- Add `VerificationSubmitPayload` with URL-only fields.
- Add `PresignedUrlResponse` type.
- Add `more_info_required` to `VerificationStatus`.
- Add authenticated-only fields to `VerificationDocument` (with `?`).

### 2. `src/services/verification.service.ts`
- Add `getPresignedUrl(fileName, fileType)` → calls `GET /uploads/presigned-url`.
- Add `uploadToPresignedUrl(file, presignedUrl, onProgress)` → direct `fetch` PUT to S3/GCS.
- Add `submitVerification(submission)` → calls `POST /mentors/verification/submit`.
- Add `getMyVerificationStatus()` → calls `GET /mentors/me/verification-status` (authenticated, includes sensitive fields).
- Keep `getMentorVerificationStatus` for public stripped data.

### 3. `src/hooks/useVerification.ts` (new)
- Manage state for:
  - `presignedUrl`, `uploadProgress` (0–100)
  - `selectedFiles`, `linkedInUrl`, `documentType`
  - `myStatus` (full data from authenticated endpoint)
  - `publicStatus` (stripped data)
- Provide `uploadFile(file)`:
  1. Request presigned URL.
  2. Upload file to S3/GCS with `XMLHttpRequest` for progress tracking.
  3. Store resulting URL.
- Provide `submit()`:
  1. Build `VerificationSubmitPayload`.
  2. Call `submitVerification`.

### 4. `src/pages/MentorVerification.tsx`
- Replace direct `FileUpload` + `uploadVerificationDocument` flow with `useVerification`.
- Show `documentType` dropdown (enum values).
- Show upload progress per file (0–100).
- Show correct state rendering:
  - `pending` → yellow
  - `approved` → green with badge
  - `rejected` → red with reason + Resubmit button
  - `more_info_required` → amber with admin message + upload form

### 5. `src/components/mentor/DocumentCard.tsx`
- Update to handle `more_info_required` status.
- Show `rejectionReason` for rejected status.
- Show `additionalInfoRequest` for `more_info_required`.

### 6. `src/components/mentor/FileUpload.tsx`
- Remove direct file upload logic.
- Keep drag-and-drop + file selection UI.
- Expose `onFileSelect` callback (file object only).
- Parent (`useVerification`) handles presigned URL + upload.

## Acceptance Criteria

- [ ] File upload UI calls presigned URL endpoint first, uploads directly to storage, then passes URL to `POST /mentors/verification/submit`.
- [ ] Show upload progress per file (0–100%).
- [ ] `documentType` rendered as a dropdown with enum values.
- [ ] Status page shows correct state: pending (yellow), approved (green + badge), rejected (red + reason), more_info_required (amber + admin message).
- [ ] Rejected status: show rejection reason + Resubmit button.
- [ ] `more_info_required`: show admin message + form to upload additional documents.
