import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import type { Message, Conversation, SendMessageRequest, MessageSearchResult, MessageSearchMeta } from '../services/messaging.service';
import MessagingService from '../services/messaging.service';
import socketService from '../services/socket.service';
import PresenceService from '../services/presence.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface EnhancedMessage extends Message {
  status?: MessageStatus;
  optimistic?: boolean;
}

export type { MessageSearchResult, MessageSearchMeta };

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    participantId: 'mentor1',
    participantName: 'Aisha Bello',
    participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    participantOnline: true,
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lastMessage: {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: 'mentor1',
      senderName: 'Aisha Bello',
      content: 'Looking forward to our session tomorrow!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      read: false,
    },
  },
  {
    id: 'conv2',
    participantId: 'mentor2',
    participantName: 'Diego Alvarez',
    participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
    participantOnline: false,
    last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastMessage: {
      id: 'msg2',
      conversationId: 'conv2',
      senderId: 'learner1',
      senderName: 'You',
      content: 'Thanks for the feedback on my code!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
    },
  },
  {
    id: 'conv3',
    participantId: 'mentor3',
    participantName: 'Nora Chen',
    participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nora',
    participantOnline: true,
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lastMessage: {
      id: 'msg3',
      conversationId: 'conv3',
      senderId: 'mentor3',
      senderName: 'Nora Chen',
      content: 'I have some resources to share with you.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
    },
  },
];

// Generate older messages for pagination demo
const makeOlderMessages = (convId: string, count: number, baseOffset: number): EnhancedMessage[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${convId}-old-${baseOffset + i}`,
    conversationId: convId,
    senderId: i % 2 === 0 ? 'learner1' : 'mentor1',
    senderName: i % 2 === 0 ? 'You' : 'Aisha Bello',
    senderAvatar: i % 2 !== 0 ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha' : undefined,
    content: `Older message ${baseOffset + i + 1} in conversation`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * (24 + baseOffset + i)).toISOString(),
    read: true,
    status: 'read' as MessageStatus,
  }));

const INITIAL_MESSAGES: Record<string, EnhancedMessage[]> = {
  conv1: [
    {
      id: 'msg1-1',
      conversationId: 'conv1',
      senderId: 'learner1',
      senderName: 'You',
      content: 'Hi Aisha! I wanted to confirm our session time.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: true,
      status: 'read',
    },
    {
      id: 'msg1-2',
      conversationId: 'conv1',
      senderId: 'mentor1',
      senderName: 'Aisha Bello',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
      content: 'Yes! Tomorrow at 2 PM works perfectly.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: true,
      status: 'read',
    },
    {
      id: 'msg1-3',
      conversationId: 'conv1',
      senderId: 'mentor1',
      senderName: 'Aisha Bello',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
      content: 'Looking forward to our session tomorrow!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      read: false,
      status: 'delivered',
    },
  ],
  conv2: [
    {
      id: 'msg2-1',
      conversationId: 'conv2',
      senderId: 'mentor2',
      senderName: 'Diego Alvarez',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
      content: 'Great work on the React component!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      read: true,
      status: 'read',
    },
    {
      id: 'msg2-2',
      conversationId: 'conv2',
      senderId: 'learner1',
      senderName: 'You',
      content: 'Thanks for the feedback on my code!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
      status: 'read',
    },
  ],
  conv3: [
    {
      id: 'msg3-1',
      conversationId: 'conv3',
      senderId: 'learner1',
      senderName: 'You',
      content: 'Hi Nora! Do you have any recommended reading?',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: true,
      status: 'read',
    },
    {
      id: 'msg3-2',
      conversationId: 'conv3',
      senderId: 'mentor3',
      senderName: 'Nora Chen',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nora',
      content: 'I have some resources to share with you.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      status: 'delivered',
    },
  ],
};

// Simulate cursor-based pagination: each conv has 20 older messages available
const OLDER_MESSAGES_POOL: Record<string, EnhancedMessage[]> = {
  conv1: makeOlderMessages('conv1', 20, 0),
  conv2: makeOlderMessages('conv2', 20, 0),
  conv3: makeOlderMessages('conv3', 20, 0),
};

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

  // Global message search state (GET /messages/search)
  const [globalSearchInput, setGlobalSearchInput] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<MessageSearchResult[]>([]);
  const [globalSearchMeta, setGlobalSearchMeta] = useState<MessageSearchMeta | null>(null);
  const [globalSearchLoading, setGlobalSearchLoading] = useState(false);
  const [globalSearchPage, setGlobalSearchPage] = useState(1);
  const globalSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presenceService = new PresenceService();

  // Cursor pagination: track the oldest message ID (cursor) per conv
  const [cursors, setCursors] = useState<Record<string, string | null>>({});
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({});

  const messagingService = useRef(new MessagingService());
  const socketRef = useRef(socketService);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  // Messages from API are newest-first (DESC); reverse for oldest-first display
  const activeMessages = useMemo(
    () => (activeConversationId ? [...(messages[activeConversationId] ?? [])].reverse() : []),
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
        setNextCursors((prev) => ({ ...prev, [activeConversationId]: null }));
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

  // ── Global search (GET /messages/search) ────────────────────────────────

  const executeGlobalSearch = useCallback(async (query: string, page: number) => {
    if (!query.trim()) return;
    setGlobalSearchLoading(true);
    try {
      const response = await messagingService.current.searchGlobal(query.trim(), page);
      setGlobalSearchResults(response.data.results);
      setGlobalSearchMeta(response.meta);
    } catch (err) {
      console.error('Global search failed:', err);
    } finally {
      setGlobalSearchLoading(false);
    }
  }, []);

  /** Called on every keystroke — debounces 300ms then fires page 1 search */
  const handleGlobalSearchInput = useCallback((value: string) => {
    setGlobalSearchInput(value);

    if (globalSearchDebounceRef.current) {
      clearTimeout(globalSearchDebounceRef.current);
    }

    if (!value.trim()) {
      setGlobalSearchQuery('');
      setGlobalSearchResults([]);
      setGlobalSearchMeta(null);
      setGlobalSearchPage(1);
      return;
    }

    globalSearchDebounceRef.current = setTimeout(() => {
      setGlobalSearchQuery(value.trim());
      setGlobalSearchPage(1);
      void executeGlobalSearch(value.trim(), 1);
    }, 300);
  }, [executeGlobalSearch]);

  const clearGlobalSearch = useCallback(() => {
    if (globalSearchDebounceRef.current) {
      clearTimeout(globalSearchDebounceRef.current);
    }
    setGlobalSearchInput('');
    setGlobalSearchQuery('');
    setGlobalSearchResults([]);
    setGlobalSearchMeta(null);
    setGlobalSearchPage(1);
  }, []);

  const globalSearchNextPage = useCallback(() => {
    if (!globalSearchMeta?.hasNext) return;
    const next = globalSearchPage + 1;
    setGlobalSearchPage(next);
    void executeGlobalSearch(globalSearchQuery, next);
  }, [globalSearchMeta, globalSearchPage, globalSearchQuery, executeGlobalSearch]);

  const globalSearchPrevPage = useCallback(() => {
    if (!globalSearchMeta?.hasPrev) return;
    const prev = globalSearchPage - 1;
    setGlobalSearchPage(prev);
    void executeGlobalSearch(globalSearchQuery, prev);
  }, [globalSearchMeta, globalSearchPage, globalSearchQuery, executeGlobalSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (globalSearchDebounceRef.current) {
        clearTimeout(globalSearchDebounceRef.current);
      }
    };
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

  // Fetch presence for conversation partners
  useEffect(() => {
    const fetchPresence = async () => {
      const participantIds = conversations.map(c => c.participantId);
      if (participantIds.length === 0) return;

      try {
        const presenceStatuses = await presenceService.getBatchStatus(participantIds);
        setConversations(prev =>
          prev.map(c => {
            const status = presenceStatuses.find(p => p.userId === c.participantId);
            if (status) {
              return {
                ...c,
                participantOnline: status.online,
                last_seen: status.last_seen,
              };
            }
            return c;
          })
        );
      } catch (error) {
        console.error('Failed to fetch presence:', error);
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 25000); // 25 seconds

    return () => clearInterval(interval);
  }, [conversations.map(c => c.participantId).join(',')]); // depend on participantIds

  // Cleanup typing timers on unmount
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
    // Global search
    globalSearchInput,
    globalSearchQuery,
    globalSearchResults,
    globalSearchMeta,
    globalSearchLoading,
    globalSearchPage,
    handleGlobalSearchInput,
    clearGlobalSearch,
    globalSearchNextPage,
    globalSearchPrevPage,
  };
};
