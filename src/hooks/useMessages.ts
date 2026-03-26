import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Message, Conversation, SendMessageRequest, SearchMessagesRequest } from '../services/messaging.service';
import MessagingService from '../services/messaging.service';

const messagingService = new MessagingService();

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

const INITIAL_MESSAGES: Record<string, Message[]> = {
  conv1: [
    {
      id: 'msg1-1',
      conversationId: 'conv1',
      senderId: 'learner1',
      senderName: 'You',
      content: 'Hi Aisha! I wanted to confirm our session time.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: true,
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
    },
    {
      id: 'msg2-2',
      conversationId: 'conv2',
      senderId: 'learner1',
      senderName: 'You',
      content: 'Thanks for the feedback on my code!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
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
    },
  ],
};

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConversation = useMemo(() => {
    return conversations.find((conv) => conv.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const activeMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return messages[activeConversationId] || [];
  }, [messages, activeConversationId]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  }, [conversations]);

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setSearchQuery('');
    setSearchResults([]);

    // Mark messages as read
    setConversations((current) =>
      current.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );

    setMessages((current) => ({
      ...current,
      [conversationId]: (current[conversationId] || []).map((msg) => ({
        ...msg,
        read: true,
      })),
    }));
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      if (!activeConversationId || !content.trim()) return;

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: 'learner1',
        senderName: 'You',
        content: content.trim(),
        timestamp: new Date().toISOString(),
        read: true,
        attachments: attachments?.map((file) => ({
          id: `att-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        })),
      };

      setMessages((current) => ({
        ...current,
        [activeConversationId]: [...(current[activeConversationId] || []), newMessage],
      }));

      setConversations((current) =>
        current.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, lastMessage: newMessage, updatedAt: newMessage.timestamp }
            : conv
        )
      );
    },
    [activeConversationId]
  );

  const searchMessages = useCallback(
    async (query: string) => {
      if (!activeConversationId || !query.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchQuery(query);
      const conversationMessages = messages[activeConversationId] || [];
      const results = conversationMessages.filter((msg) =>
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    },
    [activeConversationId, messages]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const createConversation = useCallback((participantId: string, participantName: string, participantAvatar?: string) => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participantId,
      participantName,
      participantAvatar,
      participantOnline: false,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    setConversations((current) => [newConversation, ...current]);
    setMessages((current) => ({
      ...current,
      [newConversation.id]: [],
    }));

    return newConversation;
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
    error,
    selectConversation,
    sendMessage,
    searchMessages,
    clearSearch,
    createConversation,
  };
};
