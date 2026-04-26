import React from 'react';
import type { Conversation } from '../../services/messaging.service';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const formatTimeAgo = (dateString: string): string => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatLastSeen = (lastSeen: string): string => {
  const diffMs = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(lastSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">Messages</h2>
        <p className="text-xs text-gray-400 mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-14 h-14 mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">No conversations yet</p>
            <p className="text-xs text-gray-500 mt-1">Start a conversation with a mentor</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {conversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              const lastMsgIsOwn = conv.lastMessage?.senderId === 'learner1';

              return (
                <li key={conv.id}>
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                      isActive ? 'bg-stellar/5 border-l-2 border-stellar' : ''
                    }`}
                  >
                    {/* Avatar + online dot */}
                    <div className="relative flex-shrink-0">
                      {conv.participantAvatar ? (
                        <img
                          src={conv.participantAvatar}
                          alt={conv.participantName}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-stellar flex items-center justify-center text-white font-bold text-sm">
                          {conv.participantName[0]}
                        </div>
                      )}
                      {/* Online indicator */}
                      {conv.participantOnline && (
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"
                          aria-label="Online"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                          {conv.participantName}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTimeAgo(conv.updatedAt)}
                        </span>
                      </div>

                      {/* Last message preview */}
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                          {conv.lastMessage
                            ? `${lastMsgIsOwn ? 'You: ' : ''}${conv.lastMessage.content}`
                            : 'No messages yet'}
                        </p>

                        {/* Unread badge */}
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-stellar text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Last seen */}
                      {!conv.participantOnline && conv.last_seen && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Last seen {formatLastSeen(conv.last_seen)}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
