import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

// ─── Typed errors ─────────────────────────────────────────────────────────────

export class NoSharedBookingError extends Error {
  constructor() {
    super("Messaging is only available between users who share at least one booking");
    this.name = "NoSharedBookingError";
  }
}

export class SelfMessageError extends Error {
  constructor() {
    super("You cannot message yourself");
    this.name = "SelfMessageError";
  }
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantOnline: boolean;
  last_seen?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  attachments?: File[];
}

export interface SearchMessagesRequest {
  conversationId: string;
  query: string;
}

// ─── Global message search (GET /messages/search) ─────────────────────────────

export interface MessageSearchResult {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
  /** HTML snippet with <b> tags around matched terms, from the server's headline field */
  headline?: string;
}

export interface MessageSearchMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MessageSearchResponse {
  data: {
    results: MessageSearchResult[];
    total: number;
    page: number;
    totalPages: number;
  };
  meta: MessageSearchMeta;
}

export default class MessagingService {
  async getConversations(opts?: RequestOptions) {
    return request<{ conversations: Conversation[] }>(
      {
        method: "GET",
        url: apiConfig.url.conversations,
      },
      opts,
    );
  }

  async getConversation(id: string, opts?: RequestOptions) {
    return request<Conversation>(
      {
        method: "GET",
        url: `${apiConfig.url.conversations}/${id}`,
      },
      opts,
    );
  }

  async getMessages(conversationId: string, opts?: RequestOptions) {
    return request<Message[]>(
      {
        method: "GET",
        url: `${apiConfig.url.conversations}/${conversationId}/messages`,
      },
      opts,
    );
  }

  async sendMessage(data: SendMessageRequest, opts?: RequestOptions) {
    const formData = new FormData();
    formData.append("content", data.content);
    
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    return request<Message>(
      {
        method: "POST",
        url: `${apiConfig.url.conversations}/${data.conversationId}/messages`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
      opts,
    );
  }

  async markAsRead(conversationId: string, opts?: RequestOptions) {
    return request<{ success: boolean }>(
      {
        method: "POST",
        url: `${apiConfig.url.conversations}/${conversationId}/read`,
      },
      opts,
    );
  }

  async searchMessages(data: SearchMessagesRequest, opts?: RequestOptions) {
    return request<Message[]>(
      {
        method: "GET",
        url: `${apiConfig.url.conversations}/${data.conversationId}/search`,
        params: { query: data.query },
      },
      opts,
    );
  }

  /**
   * Global message search across all conversations.
   * GET /messages/search?q={query}&page={page}
   * Returns offset-paginated results with headline HTML for match highlighting.
   */
  async searchGlobal(query: string, page = 1, opts?: RequestOptions) {
    return request<MessageSearchResponse>(
      {
        method: "GET",
        url: "/messages/search",
        params: { q: query, page },
      },
      opts,
    );
  }

  async createConversation(participantId: string, opts?: RequestOptions) {
    try {
      return await request<Conversation>(
        {
          method: "POST",
          url: apiConfig.url.conversations,
          data: { participantId },
        },
        opts,
      );
    } catch (err: unknown) {
      const status = (err as { status?: number; response?: { status?: number } })?.status
        ?? (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) throw new NoSharedBookingError();
      if (status === 400) throw new SelfMessageError();
      throw err;
    }
  }
}
