import React, { useState } from 'react';
import { useMessages } from '../hooks/useMessages';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';
import MessageInput from '../components/messaging/MessageInput';

const Messages: React.FC = () => {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    activeMessages,
    totalUnreadCount,
    searchQuery,
    searchResults,
    selectConversation,
    sendMessage,
    searchMessages,
    clearSearch,
  } = useMessages();

  const [isMobileView, setIsMobileView] = useState(false);

  const displayMessages = searchResults.length > 0 ? searchResults : activeMessages;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">
            {totalUnreadCount > 0
              ? `You have ${totalUnreadCount} unread message${totalUnreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-[380px_1fr] h-[calc(100vh-220px)]">
            {/* Conversation List */}
            <div className={`border-r border-gray-100 ${activeConversationId ? 'hidden md:block' : 'block'}`}>
              <ConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={selectConversation}
              />
            </div>

            {/* Message Thread */}
            <div className={`flex flex-col ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
              {activeConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <button
                      onClick={() => selectConversation('')}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Back to conversations"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="relative">
                      {activeConversation.participantAvatar ? (
                        <img
                          src={activeConversation.participantAvatar}
                          alt={activeConversation.participantName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-stellar flex items-center justify-center text-white font-bold">
                          {activeConversation.participantName[0]}
                        </div>
                      )}
                      {activeConversation.participantOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-bold text-gray-900 truncate">
                        {activeConversation.participantName}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {activeConversation.participantOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => searchMessages(e.target.value)}
                        className="w-48 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stellar/20 focus:border-stellar transition-all"
                      />
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {searchQuery && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search Results Info */}
                  {searchQuery && (
                    <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100">
                      <p className="text-sm text-yellow-800">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                      </p>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto">
                    <MessageThread
                      messages={displayMessages}
                      currentUserId="learner1"
                      searchQuery={searchQuery}
                    />
                  </div>

                  {/* Input */}
                  <MessageInput onSendMessage={sendMessage} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-20 h-20 mb-4 rounded-full bg-stellar/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-stellar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Choose a conversation from the list to start messaging with your mentors
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
