import React from 'react';
import type { Message } from '../../services/messaging.service';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  searchQuery?: string;
}

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  searchQuery,
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900">No messages yet</p>
        <p className="text-xs text-gray-500 mt-1">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId;
        const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId);
        const isHighlighted = searchQuery && message.content.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
          >
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
                className={`rounded-2xl px-4 py-2 ${
                  isOwn
                    ? 'bg-stellar text-white'
                    : 'bg-gray-100 text-gray-900'
                } ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-white hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                            {attachment.name}
                          </p>
                          <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                {isOwn && (
                  <span className="text-xs text-gray-400">
                    {message.read ? (
                      <svg className="w-4 h-4 text-stellar" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageThread;
