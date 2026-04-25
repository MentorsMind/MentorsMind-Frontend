import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import type { Message, Conversation, SendMessageRequest } from '../services/messaging.service';
import MessagingService from '../services/messaging.service';
import socketService from '../services/socket.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface EnhancedMessage extends Message {
  status?: MessageStatus;
  optimistic?: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, EnhancedMessage[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cursor pagination: track the oldest message ID (cursor) per conv
  const [cursors, setCursors] = useState<Record<string, string | null>>({});
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({});

  const messagingService = useRef(new MessagingService());
  const socketRef = useRef(socketService);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const activeMessages = useMemo(
    () => (activeConversationId ? messages[activeConversationId] ?? [] : []),
    [messages, activeConversationId]
  );

  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations]
  );

  // ── API Calls ────────────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await messagingService.current.getConversations();
      setConversations(data);
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    try {
      const data = await messagingService.current.getMessages(conversationId);
      setMessages((prev) => ({ ...prev, [conversationId]: data }));
      
      // Set cursor to the oldest message ID
      if (data.length > 0) {
        setCursors((prev) => ({ ...prev, [conversationId]: data[0].id }));
        setHasMore((prev) => ({ ...prev, [conversationId]: data.length >= 20 }));
      }
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversationId || isLoadingMore || !hasMore[activeConversationId]) return;

    const cursor = cursors[activeConversationId];
    if (!cursor) return;

    setIsLoadingMore(true);
    try {
      const data = await messagingService.current.getMessages(activeConversationId, {
        params: { before: cursor, limit: 20 },
      });

      if (data.length > 0) {
        setMessages((prev) => ({
          ...prev,
          [activeConversationId]: [...data, ...(prev[activeConversationId] ?? [])],
        }));
        setCursors((prev) => ({ ...prev, [activeConversationId]: data[0].id }));
        setHasMore((prev) => ({ ...prev, [activeConversationId]: data.length >= 20 }));
      } else {
        setHasMore((prev) => ({ ...prev, [activeConversationId]: false }));
      }
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeConversationId, cursors, hasMore, isLoadingMore]);

  // ── Socket Events ────────────────────────────────────────────────────────

  useEffect(() => {
    socketRef.current.connect();

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        const existing = prev[message.conversationId] || [];
        if (existing.some((m) => m.id === message.id)) return prev;
        return {
          ...prev,
          [message.conversationId]: [...existing, message],
        };
      });

      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === message.conversationId);
        if (index === -1) {
          // If conversation doesn't exist, we might need to fetch it
          void loadConversations();
          return prev;
        }

        const next = [...prev];
        const conv = next[index];
        next[index] = {
          ...conv,
          lastMessage: message,
          updatedAt: message.timestamp,
          unreadCount: message.conversationId === activeConversationId ? 0 : (conv.unreadCount || 0) + 1,
        };
        // Move to top
        return [next[index], ...next.filter((_, i) => i !== index)];
      });

      if (message.conversationId === activeConversationId) {
        void messagingService.current.markAsRead(message.conversationId);
      }
    };

    const handleReadReceipt = ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
      setMessages((prev) => {
        const list = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: list.map((m) => (m.id === messageId ? { ...m, read: true, status: 'read' as MessageStatus } : m)),
        };
      });
    };

    socketRef.current.on('message:new', handleNewMessage);
    socketRef.current.on('message:read', handleReadReceipt);

    return () => {
      socketRef.current.off('message:new', handleNewMessage);
      socketRef.current.off('message:read', handleReadReceipt);
    };
  }, [activeConversationId, loadConversations]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId || null);
    if (conversationId) {
      void loadMessages(conversationId);
      void messagingService.current.markAsRead(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, [loadMessages]);

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!activeConversationId || (!content.trim() && !attachments?.length)) return;

    try {
      const newMessage = await messagingService.current.sendMessage({
        conversationId: activeConversationId,
        content: content.trim(),
        attachments,
      });

      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] ?? []), newMessage],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMessage: newMessage, updatedAt: newMessage.timestamp }
            : c
        )
      );
    } catch (err) {
      setError('Failed to send message');
    }
  }, [activeConversationId]);

  const searchMessages = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!activeConversationId || !query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await messagingService.current.searchMessages({
        conversationId: activeConversationId,
        query,
      });
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    }
  }, [activeConversationId]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const createConversation = useCallback(async (participantId: string) => {
    try {
      const newConv = await messagingService.current.createConversation(participantId);
      setConversations((prev) => [newConv, ...prev]);
      return newConv;
    } catch (err) {
      setError('Failed to create conversation');
      return null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

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
    hasMore: activeConversationId ? (hasMore[activeConversationId] ?? false) : false,
    selectConversation,
    sendMessage,
    searchMessages,
    clearSearch,
    createConversation,
    loadMoreMessages,
  };
};
