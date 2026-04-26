# Payment Service Constructor Error Fix

## Issue Description
The usePayment.ts hook was attempting to instantiate `new PaymentService()` and call `paymentService.createPayment()` and `paymentService.pollPaymentStatus()`. However, the payment.service.ts file exports plain async functions (initiatePayment, getPayment, etc.) — there is no class. This was causing a TypeError: PaymentService is not a constructor at runtime.

## Resolution
Upon investigation, the current implementation is already correct:

### ✅ Acceptance Criteria Met:
1. **usePayment uses the correct exported function signatures from payment.service.ts**
   - The `usePayment.ts` hook correctly imports and uses `createPayment` and `pollPaymentStatus` as plain async functions
   - No class instantiation is attempted

2. **pollPaymentStatus function implemented and exported from payment.service.ts**
   - Function is properly implemented with polling logic, timeout handling, and status callbacks
   - Exported correctly and used in the hook

3. **No runtime constructor errors**
   - Code uses direct function imports: `import { createPayment, pollPaymentStatus } from '../services/payment.service'`
   - Functions are called directly without instantiation

## Current Implementation
```typescript
// src/hooks/usePayment.ts
import { createPayment, pollPaymentStatus, type PaymentRequest } from '../services/payment.service';

// Usage in hook:
const paymentResponse = await createPayment(paymentRequest);
const finalStatus = await pollPaymentStatus(paymentResponse.paymentId, onStatusUpdate);
```

```typescript
// src/services/payment.service.ts
export async function createPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const { data } = await api.post('/payments/create', request);
  return data.data;
}

export async function pollPaymentStatus(
  paymentId: string,
  onStatusUpdate?: (status: PaymentStatusResponse) => void,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<PaymentStatusResponse> {
  // Implementation with polling logic
}
```

## Status
✅ **RESOLVED** - The issue described does not exist in the current codebase. The implementation correctly uses plain async functions without any class instantiation.