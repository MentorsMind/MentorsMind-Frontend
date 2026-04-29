import React, { useEffect, useRef, useCallback } from 'react';
import type { EnhancedMessage, MessageStatus } from '../../hooks/useMessages';

interface MessageThreadProps {
  messages: EnhancedMessage[];
  currentUserId: string;
  searchQuery?: string;
  isTyping?: boolean;
  typingName?: string;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const isImageType = (type: string) => type.startsWith('image/');
const isPdfType = (type: string) => type === 'application/pdf';

// ─── Status ticks ─────────────────────────────────────────────────────────────

const StatusTick: React.FC<{ status?: MessageStatus }> = ({ status }) => {
  if (!status || status === 'sending') {
    return (
      <svg className="w-3.5 h-3.5 text-gray-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
      </svg>
    );
  }
  if (status === 'sent') {
    return (
      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === 'delivered') {
    // Double tick
    return (
      <span className="inline-flex -space-x-1.5">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  // read – blue double tick
  return (
    <span className="inline-flex -space-x-1.5">
      <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
};

// ─── Typing bubble ────────────────────────────────────────────────────────────

const TypingBubble: React.FC<{ name?: string }> = ({ name }) => (
  <div className="flex items-end gap-2">
    <div className="w-8 h-8 flex-shrink-0" />
    <div className="flex flex-col items-start">
      {name && <span className="text-xs text-gray-400 mb-1">{name} is typing…</span>}
      <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Attachment renderer ──────────────────────────────────────────────────────

const AttachmentItem: React.FC<{
  attachment: { id: string; name: string; size: number; type: string; url: string };
  isOwn: boolean;
}> = ({ attachment, isOwn }) => {
  if (isImageType(attachment.type)) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block mt-2">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-w-[220px] max-h-[180px] rounded-xl object-cover border border-white/20"
          loading="lazy"
        />
        <p className={`text-xs mt-1 truncate ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
          {attachment.name}
        </p>
      </a>
    );
  }

  if (isPdfType(attachment.type)) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 mt-2 p-2 rounded-xl ${
          isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-white hover:bg-gray-50'
        } transition-colors`}
      >
        {/* PDF icon */}
        <svg className={`w-8 h-8 flex-shrink-0 ${isOwn ? 'text-white' : 'text-red-500'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17.5h-1v-5h1.8c1.1 0 1.7.6 1.7 1.5 0 1-.7 1.5-1.8 1.5H8.5v2zm0-2.8h.7c.5 0 .8-.2.8-.7s-.3-.7-.8-.7H8.5v1.4zm4.5 2.8h-1.5v-5H13c1.4 0 2.3.9 2.3 2.5s-.9 2.5-2.3 2.5zm-.5-4.2v3.4h.4c.8 0 1.3-.5 1.3-1.7s-.5-1.7-1.3-1.7h-.4zm4.5 4.2h-1v-5h2.8v.8H17v1.3h1.6v.8H17v2.1z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
            {attachment.name}
          </p>
          <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
            {(attachment.size / 1024).toFixed(1)} KB · PDF
          </p>
        </div>
      </a>
    );
  }

  // Generic file
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 mt-2 p-2 rounded-xl ${
        isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-white hover:bg-gray-50'
      } transition-colors`}
    >
      <svg className={`w-5 h-5 flex-shrink-0 ${isOwn ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>{attachment.name}</p>
        <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>{(attachment.size / 1024).toFixed(1)} KB</p>
      </div>
    </a>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  searchQuery,
  isTyping = false,
  typingName,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // Scroll to bottom on new messages (not when loading older ones)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Preserve scroll position when older messages are prepended
  useEffect(() => {
    if (!isLoadingMore && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      if (diff > 0) {
        containerRef.current.scrollTop += diff;
      }
    }
  }, [isLoadingMore, messages]);

  // Intersection observer for infinite scroll upward
  const handleTopSentinel = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        if (containerRef.current) {
          prevScrollHeightRef.current = containerRef.current.scrollHeight;
        }
        onLoadMore?.();
      }
    },
    [hasMore, isLoadingMore, onLoadMore]
  );

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleTopSentinel, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleTopSentinel]);

  // ── Empty state ────────────────────────────────────────────────────────────

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">No messages yet</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Say hello! This is the beginning of your conversation.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full overflow-y-auto p-4 space-y-3">
      {/* Top sentinel for infinite scroll */}
      <div ref={topSentinelRef} className="h-1" />

      {/* Loading older messages spinner */}
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}

      {/* "No more messages" hint */}
      {!hasMore && messages.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-1">Beginning of conversation</p>
      )}

      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId;
        const showAvatar =
          !isOwn &&
          (index === 0 || messages[index - 1].senderId !== message.senderId);
        const isDeleted = message.content === '[Message deleted]';
        const isHighlighted =
          !isDeleted && searchQuery && message.content.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          <div
            key={message.id}
            id={`msg-${message.id}`}
            className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${
              message.optimistic ? 'opacity-70' : 'opacity-100'
            } transition-opacity`}
          >
            {/* Avatar placeholder for alignment */}
            {!isOwn && (
              <div className="flex-shrink-0 w-8 h-8">
                {showAvatar && message.senderAvatar ? (
                  <img
                    src={message.senderAvatar}
                    alt={message.senderName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8" />
                )}
              </div>
            )}

            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
              <div
                className={`rounded-2xl px-4 py-2.5 ${
                  isDeleted
                    ? 'bg-gray-50 border border-gray-200'
                    : isOwn ? 'bg-stellar text-white' : 'bg-gray-100 text-gray-900'
                } ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {isDeleted ? (
                  <p className="text-sm italic text-gray-400">[Message deleted]</p>
                ) : (
                  <>
                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    {message.attachments?.map((att) => (
                  <AttachmentItem key={att.id} attachment={att} isOwn={isOwn} />
                ))}
                  </>
                )}
              </div>

              {/* Timestamp + status */}
              <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                {isOwn && <StatusTick status={message.status} />}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isTyping && <TypingBubble name={typingName} />}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageThread;
