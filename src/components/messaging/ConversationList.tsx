import React from 'react';
import type { Conversation } from '../../services/messaging.service';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const formatTimeAgo = (dateString: string): string => {
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
  return date.toLocaleDateString();
};

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500">{conversations.length} conversations</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">No conversations yet</p>
            <p className="text-xs text-gray-500 mt-1">Start a conversation with a mentor</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                    activeConversationId === conversation.id ? 'bg-stellar/5' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {conversation.participantAvatar ? (
                      <img
                        src={conversation.participantAvatar}
                        alt={conversation.participantName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-stellar flex items-center justify-center text-white font-bold">
                        {conversation.participantName[0]}
                      </div>
                    )}
                    {conversation.participantOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {conversation.participantName}
                      </h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTimeAgo(conversation.updatedAt)}
                      </span>
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {conversation.lastMessage.senderId === 'learner1' && 'You: '}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {conversation.unreadCount > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 bg-stellar text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
