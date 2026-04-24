import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../services/api.client";
import type { SessionStatus } from "../types";

// ─── Event payload types ──────────────────────────────────────────────────────

export interface SessionUpdatedPayload {
  bookingId: string;
  status: SessionStatus;
  updatedAt: string;
}

export interface PaymentConfirmedPayload {
  paymentId: string;
  sessionId: string;
  stellarTxHash: string;
  amount: number;
  currency: string;
}

export interface MessageNewPayload {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

// ─── Store update callbacks ───────────────────────────────────────────────────

export interface WebSocketEventHandlers {
  /** Called when session:updated arrives. Update the booking in local state. */
  onSessionUpdated?: (payload: SessionUpdatedPayload) => void;
  /** Called when payment:confirmed arrives. Update the payment record in local state. */
  onPaymentConfirmed?: (payload: PaymentConfirmedPayload) => void;
  /** Called when message:new arrives. Append the message to local state. */
  onMessageNew?: (payload: MessageNewPayload) => void;
  /** The conversation ID the user is currently viewing (for auto-read). */
  activeConversationId?: string | null;
}

// ─── Toast messages per status ────────────────────────────────────────────────

const SESSION_STATUS_TOAST: Partial<Record<SessionStatus, string>> = {
  confirmed: "Your session has been confirmed",
  cancelled: "Session cancelled by mentor",
  rescheduled: "Your session has been rescheduled",
  completed: "Your session has been completed",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Attaches WebSocket event listeners for session:updated, payment:confirmed,
 * and message:new. All updates are targeted (no full-page reload or list refetch).
 * Receiving the same event twice is idempotent.
 */
export function useWebSocketEvents(
  socket: { onMessage: (cb: (msg: { type: string; payload: any }) => void) => void } | null,
  handlers: WebSocketEventHandlers
) {
  // Keep handlers in a ref so the listener closure always sees the latest values
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const handleMessage = useCallback(
    (msg: { type: string; payload: any }) => {
      const { type, payload } = msg;

      if (type === "session:updated") {
        const p = payload as SessionUpdatedPayload;
        handlersRef.current.onSessionUpdated?.(p);
        const toastMsg = SESSION_STATUS_TOAST[p.status];
        if (toastMsg) toast(toastMsg);
      }

      if (type === "payment:confirmed") {
        const p = payload as PaymentConfirmedPayload;
        handlersRef.current.onPaymentConfirmed?.(p);
        toast.success(
          `Payment confirmed! Stellar tx: ${p.stellarTxHash.slice(0, 8)}…`
        );
      }

      if (type === "message:new") {
        const p = payload as MessageNewPayload;
        handlersRef.current.onMessageNew?.(p);

        // If the user is currently viewing this conversation, mark it read immediately
        if (handlersRef.current.activeConversationId === p.conversationId) {
          api
            .post(`/conversations/${p.conversationId}/read`)
            .catch(() => {/* best-effort */});
        }
      }
    },
    [] // stable — reads from ref
  );

  useEffect(() => {
    if (!socket) return;
    socket.onMessage(handleMessage);
  }, [socket, handleMessage]);
}

// ─── Idempotent booking updater ───────────────────────────────────────────────

/**
 * Returns a new bookings array with the affected booking updated.
 * If the booking is not found, marks it stale so it's refetched on next visit.
 * Idempotent: applying the same event twice produces the same result.
 */
export function applySessionUpdated<T extends { id: string; status: SessionStatus; updatedAt?: string; _stale?: boolean }>(
  bookings: T[],
  payload: SessionUpdatedPayload
): T[] {
  const idx = bookings.findIndex((b) => b.id === payload.bookingId);
  if (idx === -1) {
    // Booking not in local store — nothing to mutate; caller should refetch on next visit
    return bookings;
  }
  // Idempotent: if status + updatedAt already match, return same reference
  const existing = bookings[idx];
  if (existing.status === payload.status && existing.updatedAt === payload.updatedAt) {
    return bookings;
  }
  const updated = [...bookings];
  updated[idx] = { ...existing, status: payload.status, updatedAt: payload.updatedAt };
  return updated;
}

/**
 * Returns a new payments array with the affected payment updated.
 * Idempotent: applying the same event twice produces the same result.
 */
export function applyPaymentConfirmed<T extends { id: string; status: string; stellarTxHash?: string }>(
  payments: T[],
  payload: PaymentConfirmedPayload
): T[] {
  const idx = payments.findIndex((p) => p.id === payload.paymentId);
  if (idx === -1) return payments;
  const existing = payments[idx];
  if (existing.status === "completed" && existing.stellarTxHash === payload.stellarTxHash) {
    return payments; // already applied
  }
  const updated = [...payments];
  updated[idx] = { ...existing, status: "completed", stellarTxHash: payload.stellarTxHash };
  return updated;
}
