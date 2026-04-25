import React from 'react';
import type { Conversation } from '../../services/messaging.service';
import UserAvatar from '../ui/UserAvatar';

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

const LastMessagePreview: React.FC<{ body: string | null; hasUnread: boolean }> = ({ body, hasUnread }) => {
  if (body === null) {
    return <p className="text-xs truncate italic text-gray-400">No messages yet</p>;
  }
  if (body === '[Message deleted]') {
    return <p className="text-xs truncate italic text-gray-400">[Message deleted]</p>;
  }
  return (
    <p className={`text-xs truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
      {body}
    </p>
  );
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
        <p className="text-xs text-gray-400 mt-0.5">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
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
              const hasUnread = conv.unread_count > 0;

              return (
                <li key={conv.id}>
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                      isActive ? 'bg-stellar/5 border-l-2 border-stellar' : ''
                    }`}
                  >
                    <UserAvatar
                      avatarUrl={conv.other_user_avatar}
                      name={conv.other_user_name}
                      size="md"
                      className="flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                          {conv.other_user_name}
                        </span>
                        {conv.last_message_at && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTimeAgo(conv.last_message_at)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <LastMessagePreview body={conv.last_message_body} hasUnread={hasUnread} />

                        {hasUnread && (
                          <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-stellar text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {conv.unread_count > 99 ? '99+' : conv.unread_count}
                          </span>
                        )}
                      </div>
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
