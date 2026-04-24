import { useCallback, useMemo, useState } from 'react';
import type { Message, Conversation } from '../services/messaging.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface EnhancedMessage extends Message {
  status?: MessageStatus;
  optimistic?: boolean;
}

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
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, EnhancedMessage[]>>(INITIAL_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typing indicators: set of conversation IDs where the other user is typing
  const [typingConversations, setTypingConversations] = useState<Set<string>>(new Set());
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Cursor pagination: track how many older messages have been loaded per conv
  const [cursors, setCursors] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({
    conv1: true,
    conv2: true,
    conv3: true,
  });

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const activeMessages = useMemo(
    () => (activeConversationId ? messages[activeConversationId] ?? [] : []),
    [messages, activeConversationId]
  );

  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  const isTyping = useMemo(
    () => (activeConversationId ? typingConversations.has(activeConversationId) : false),
    [typingConversations, activeConversationId]
  );

  // ── Socket-style event handlers ──────────────────────────────────────────

  /** Call this when the server emits a "typing" event for a conversation */
  const handleRemoteTyping = useCallback((conversationId: string) => {
    setTypingConversations((prev) => new Set(prev).add(conversationId));

    // Auto-clear after 3 s of no new typing events
    if (typingTimers.current[conversationId]) {
      clearTimeout(typingTimers.current[conversationId]);
    }
    typingTimers.current[conversationId] = setTimeout(() => {
      setTypingConversations((prev) => {
        const next = new Set(prev);
        next.delete(conversationId);
        return next;
      });
    }, 3000);
  }, []);

  /** Call this when the server emits a new incoming message */
  const handleIncomingMessage = useCallback((message: EnhancedMessage) => {
    setMessages((prev) => ({
      ...prev,
      [message.conversationId]: [...(prev[message.conversationId] ?? []), message],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === message.conversationId
          ? {
              ...c,
              lastMessage: message,
              updatedAt: message.timestamp,
              unreadCount: c.id === activeConversationId ? 0 : c.unreadCount + 1,
            }
          : c
      )
    );
    // Clear typing indicator when message arrives
    setTypingConversations((prev) => {
      const next = new Set(prev);
      next.delete(message.conversationId);
      return next;
    });
  }, [activeConversationId]);

  /** Call this when the server confirms delivery/read status */
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

  // ── Conversation selection ────────────────────────────────────────────────

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId || null);
    setSearchQuery('');
    setSearchResults([]);

    if (!conversationId) return;

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] ?? []).map((m) => ({
        ...m,
        read: true,
        status: m.senderId !== 'learner1' ? ('read' as MessageStatus) : m.status,
      })),
    }));
  }, []);

  // ── Cursor-based pagination ───────────────────────────────────────────────

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversationId || isLoadingMore || !hasMore[activeConversationId]) return;

    setIsLoadingMore(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    const pool = OLDER_MESSAGES_POOL[activeConversationId] ?? [];
    const loaded = cursors[activeConversationId] ?? 0;
    const PAGE = 10;
    const slice = pool.slice(loaded, loaded + PAGE);

    if (slice.length > 0) {
      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: [...slice, ...(prev[activeConversationId] ?? [])],
      }));
      const newLoaded = loaded + slice.length;
      setCursors((prev) => ({ ...prev, [activeConversationId]: newLoaded }));
      if (newLoaded >= pool.length) {
        setHasMore((prev) => ({ ...prev, [activeConversationId]: false }));
      }
    } else {
      setHasMore((prev) => ({ ...prev, [activeConversationId]: false }));
    }

    setIsLoadingMore(false);
  }, [activeConversationId, isLoadingMore, hasMore, cursors]);

  // ── Optimistic send ───────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      if (!activeConversationId || (!content.trim() && !attachments?.length)) return;

      const tempId = `optimistic-${Date.now()}`;
      const optimisticMsg: EnhancedMessage = {
        id: tempId,
        conversationId: activeConversationId,
        senderId: 'learner1',
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

      // Store previous state for rollback
      const prevMessages = { ...messages };
      const prevConversations = [...conversations];

      // Optimistic update
      setMessages((current) => ({
        ...current,
        [activeConversationId]: [...(current[activeConversationId] || []), newMessage],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMessage: optimisticMsg, updatedAt: optimisticMsg.timestamp }
            : c
        )
      );

      try {
        // Simulate API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Randomly fail 10% of the time for demonstration
            if (Math.random() < 0.1) reject(new Error('Network error: Failed to send message'));
            else resolve(true);
          }, 1000);
        });
      } catch (err) {
        // Rollback on failure
        setMessages(prevMessages);
        setConversations(prevConversations);
        setError(err instanceof Error ? err.message : 'Failed to send message');
        
        // In a real app, you would use a toast notification here
        console.error('Optimistic update failed, rolled back:', err);
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

  // ── Create conversation ───────────────────────────────────────────────────

  const createConversation = useCallback(
    (participantId: string, participantName: string, participantAvatar?: string) => {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        participantId,
        participantName,
        participantAvatar,
        participantOnline: false,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setMessages((prev) => ({ ...prev, [newConv.id]: [] }));
      setHasMore((prev) => ({ ...prev, [newConv.id]: false }));
      return newConv;
    },
    []
  );

  // Cleanup typing timers on unmount
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
    hasMore: activeConversationId ? (hasMore[activeConversationId] ?? false) : false,
    selectConversation,
    sendMessage,
    searchMessages,
    clearSearch,
    createConversation,
    loadMoreMessages,
    handleRemoteTyping,
    handleIncomingMessage,
    handleStatusUpdate,
  };
};
