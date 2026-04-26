import React, { useEffect } from 'react';
import { NotificationProvider } from '../contexts/NotificationContext';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNotifications } from '../contexts/NotificationContext';

const WebSocketIntegrationExample: React.FC = () => {
  const {
    isConnected,
    connectionState,
    reconnectAttempts,
    sendMessage,
  } = useWebSocket({
    url: 'ws://localhost:8080/ws',
    autoConnect: true,
    onConnect: () => {
      console.log('WebSocket connected successfully');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  const { addNotification } = useNotifications();

  const simulateNotification = (type: string) => {
    switch (type) {
      case 'session_booking':
        addNotification({
          type: 'session_booking',
          title: 'New Session Booking',
          message: 'You have a new session booking: "Advanced React Patterns"',
          priority: 'high',
          actionUrl: '/sessions/123',
          actionLabel: 'View Session',
        });
        break;

      case 'payment_confirmed':
        addNotification({
          type: 'payment_confirmed',
          title: 'Payment Confirmed',
          message: 'Payment of 100 XLM has been confirmed',
          priority: 'medium',
          actionUrl: '/payments/456',
          actionLabel: 'View Payment',
        });
        break;

      case 'session_cancelled':
        addNotification({
          type: 'session_cancelled',
          title: 'Session Cancelled',
          message: 'Session "Advanced React Patterns" has been cancelled',
          priority: 'high',
          actionUrl: '/sessions/123',
          actionLabel: 'View Details',
        });
        break;

      case 'message':
        addNotification({
          type: 'message',
          title: 'New message from John Doe',
          message: 'Hey! Can we reschedule our session?',
          priority: 'medium',
          actionUrl: '/messages/789',
          actionLabel: 'View Message',
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">WebSocket Integration Test</h1>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Connection Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {connectionState}
              </span>
              {reconnectAttempts > 0 && (
                <span className="text-sm text-gray-600">
                  (Reconnect attempts: {reconnectAttempts})
                </span>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Test Notifications:</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => simulateNotification('session_booking')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Simulate Session Booking
                </button>
                <button
                  onClick={() => simulateNotification('payment_confirmed')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Simulate Payment Confirmed
                </button>
                <button
                  onClick={() => simulateNotification('session_cancelled')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Simulate Session Cancelled
                </button>
                <button
                  onClick={() => simulateNotification('message')}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Simulate New Message
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">WebSocket Actions:</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => sendMessage({ type: 'ping', payload: {} })}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Ping
                </button>
                <button
                  onClick={() => sendMessage({ 
                    type: 'message', 
                    payload: { content: 'Test message from client' } 
                  })}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Test Message
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Notification Center</h2>
          <NotificationCenter 
            enableRealTime={true}
            showConnectionStatus={true}
          />
        </div>
      </div>
    </div>
  );
};

const AppWithNotificationProvider: React.FC = () => {
  return (
    <NotificationProvider enableToasts={true} enableSounds={false}>
      <WebSocketIntegrationExample />
    </NotificationProvider>
  );
};

export default AppWithNotificationProvider;
