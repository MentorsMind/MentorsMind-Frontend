import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Message, Conversation } from '../services/messaging.service';
import MessagingService from '../services/messaging.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface EnhancedMessage extends Message {
  status?: MessageStatus;
  optimistic?: boolean;
}

const messagingService = new MessagingService();

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, EnhancedMessage[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [typingConversations, setTypingConversations] = useState<Set<string>>(new Set());
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Load conversations ────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    messagingService
      .getConversations()
      .then((res) => {
        if (!cancelled) setConversations(res.data.conversations);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load conversations');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const activeMessages = useMemo(
    () => (activeConversationId ? messages[activeConversationId] ?? [] : []),
    [messages, activeConversationId]
  );

  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread_count, 0),
    [conversations]
  );

  const isTyping = useMemo(
    () => (activeConversationId ? typingConversations.has(activeConversationId) : false),
    [typingConversations, activeConversationId]
  );

  // ── Mark conversation read (optimistic decrement) ─────────────────────────

  const markConversationRead = useCallback(async (conversationId: string) => {
    // Optimistically zero out unread_count immediately
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
    );
    try {
      await messagingService.markAsRead(conversationId);
    } catch {
      // Best-effort — don't revert; the badge will reconcile on next fetch
    }
  }, []);

  // ── Conversation selection ────────────────────────────────────────────────

  const selectConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId || null);
      setSearchQuery('');
      setSearchResults([]);

      if (!conversationId) return;

      // Load messages if not already cached
      if (!messages[conversationId]) {
        try {
          const res = await messagingService.getMessages(conversationId);
          setMessages((prev) => ({ ...prev, [conversationId]: res.data as EnhancedMessage[] }));
        } catch {
          // non-fatal
        }
      }

      // Mark as read if there are unread messages
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv && conv.unread_count > 0) {
        markConversationRead(conversationId);
      }
    },
    [messages, conversations, markConversationRead]
  );

  // ── Socket-style event handlers ───────────────────────────────────────────

  const handleRemoteTyping = useCallback((conversationId: string) => {
    setTypingConversations((prev) => new Set(prev).add(conversationId));
    if (typingTimers.current[conversationId]) clearTimeout(typingTimers.current[conversationId]);
    typingTimers.current[conversationId] = setTimeout(() => {
      setTypingConversations((prev) => {
        const next = new Set(prev);
        next.delete(conversationId);
        return next;
      });
    }, 3000);
  }, []);

  const handleIncomingMessage = useCallback(
    (message: EnhancedMessage) => {
      setMessages((prev) => ({
        ...prev,
        [message.conversationId]: [...(prev[message.conversationId] ?? []), message],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversationId
            ? {
                ...c,
                last_message_body: message.content,
                last_message_at: message.timestamp,
                unread_count: c.id === activeConversationId ? 0 : c.unread_count + 1,
              }
            : c
        )
      );
      setTypingConversations((prev) => {
        const next = new Set(prev);
        next.delete(message.conversationId);
        return next;
      });
    },
    [activeConversationId]
  );

  const handleStatusUpdate = useCallback(
    (conversationId: string, messageId: string, status: MessageStatus) => {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] ?? []).map((m) =>
          m.id === messageId ? { ...m, status } : m
        ),
      }));
    },
    []
  );

  // ── Optimistic send ───────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      if (!activeConversationId || (!content.trim() && !attachments?.length)) return;

      const tempId = `optimistic-${Date.now()}`;
      const optimisticMsg: EnhancedMessage = {
        id: tempId,
        conversationId: activeConversationId,
        senderId: 'me',
        senderName: 'You',
        content: content.trim(),
        timestamp: new Date().toISOString(),
        read: true,
        status: 'sending',
        optimistic: true,
        attachments: attachments?.map((f, i) => ({
          id: `att-${tempId}-${i}`,
          name: f.name,
          size: f.size,
          type: f.type,
          url: URL.createObjectURL(f),
        })),
      };

      const prevMessages = { ...messages };
      const prevConversations = [...conversations];

      setMessages((current) => ({
        ...current,
        [activeConversationId]: [...(current[activeConversationId] ?? []), optimisticMsg],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, last_message_body: optimisticMsg.content, last_message_at: optimisticMsg.timestamp }
            : c
        )
      );

      try {
        const res = await messagingService.sendMessage({
          conversationId: activeConversationId,
          content: content.trim(),
          attachments,
        });
        const confirmed = res.data as EnhancedMessage;
        setMessages((current) => ({
          ...current,
          [activeConversationId]: (current[activeConversationId] ?? []).map((m) =>
            m.id === tempId ? { ...confirmed, status: 'sent' } : m
          ),
        }));
      } catch (err) {
        setMessages(prevMessages);
        setConversations(prevConversations);
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    },
    [activeConversationId, messages, conversations]
  );

  // ── Search ────────────────────────────────────────────────────────────────

  const searchMessages = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!activeConversationId || !query.trim()) {
        setSearchResults([]);
        return;
      }
      const results = (messages[activeConversationId] ?? []).filter((m) =>
        m.content.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    },
    [activeConversationId, messages]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    activeMessages,
    totalUnreadCount,
    searchQuery,
    searchResults,
    isLoading,
    isLoadingMore,
    error,
    isTyping,
    selectConversation,
    sendMessage,
    searchMessages,
    clearSearch,
    markConversationRead,
    handleRemoteTyping,
    handleIncomingMessage,
    handleStatusUpdate,
  };
};
