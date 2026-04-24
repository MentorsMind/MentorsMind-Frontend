# WebSocket Notification System - Usage Guide

## Overview
The WebSocket notification system provides real-time updates for session bookings, payments, and messages in the MentorsMind application.

## Quick Start

### 1. Basic Integration
```tsx
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationCenter } from './components/notifications/NotificationCenter';

function App() {
  return (
    <NotificationProvider enableToasts={true} enableSounds={false}>
      <NotificationCenter 
        enableRealTime={true}
        websocketUrl="ws://localhost:8080/ws"
        authToken={userToken}
      />
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

### 2. Using the WebSocket Hook
```tsx
import { useWebSocket } from './hooks/useWebSocket';
import { useNotifications } from './contexts/NotificationContext';

function MyComponent() {
  const { isConnected, sendMessage, lastMessage } = useWebSocket({
    url: 'ws://localhost:8080/ws',
    authToken: 'your-jwt-token',
    autoConnect: true,
    onConnect: () => console.log('Connected!'),
    onMessage: (message) => console.log('Received:', message),
  });

  const { addNotification } = useNotifications();

  const sendTestMessage = () => {
    sendMessage({
      type: 'message',
      payload: { content: 'Hello from client!' }
    });
  };

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={sendTestMessage}>Send Message</button>
    </div>
  );
}
```

## WebSocket Message Types

### Server → Client Messages

#### Session Booking
```json
{
  "type": "session_booking",
  "payload": {
    "sessionId": "123",
    "sessionTitle": "Advanced React Patterns",
    "mentorId": "mentor_456",
    "learnerId": "learner_789"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "id": "msg_123"
}
```

#### Payment Confirmed
```json
{
  "type": "payment_confirmed",
  "payload": {
    "paymentId": "pay_456",
    "amount": "100",
    "currency": "XLM",
    "sessionId": "123"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "id": "msg_124"
}
```

#### Session Cancelled
```json
{
  "type": "session_cancelled",
  "payload": {
    "sessionId": "123",
    "sessionTitle": "Advanced React Patterns",
    "cancelledBy": "learner",
    "reason": "Schedule conflict"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "id": "msg_125"
}
```

#### Session Rescheduled
```json
{
  "type": "session_rescheduled",
  "payload": {
    "sessionId": "123",
    "sessionTitle": "Advanced React Patterns",
    "oldTime": "2024-01-01T14:00:00Z",
    "newTime": "2024-01-01T16:00:00Z",
    "rescheduledBy": "mentor"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "id": "msg_126"
}
```

#### New Message
```json
{
  "type": "message",
  "payload": {
    "conversationId": "conv_789",
    "senderId": "user_456",
    "senderName": "John Doe",
    "content": "Hey! Can we reschedule?"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "id": "msg_127"
}
```

### Client → Server Messages

#### Ping (Heartbeat)
```json
{
  "type": "ping",
  "payload": {},
  "timestamp": "2024-01-01T12:00:00Z",
  "id": "ping_123"
}
```

#### Custom Message
```json
{
  "type": "message",
  "payload": {
    "content": "Hello from client!",
    "recipientId": "user_789"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "id": "msg_128"
}
```

## Configuration Options

### WebSocket Service Configuration
```typescript
const config = {
  url: 'ws://localhost:8080/ws',
  reconnectInterval: 3000,        // Reconnection delay in ms
  maxReconnectAttempts: 10,       // Max reconnection attempts
  heartbeatInterval: 30000,       // Heartbeat interval in ms
};
```

### Notification Provider Options
```typescript
<NotificationProvider 
  enableToasts={true}           // Show toast notifications
  enableSounds={false}           // Play notification sounds
>
  {/* App content */}
</NotificationProvider>
```

### NotificationCenter Props
```typescript
<NotificationCenter
  className="custom-styles"
  maxVisible={10}                // Max notifications to show
  showConnectionStatus={true}    // Show WebSocket status
  enableRealTime={true}          // Enable real-time updates
  websocketUrl="ws://localhost:8080/ws"
  authToken={userToken}
/>
```

## Notification Types and Priorities

### Notification Types
- `session_booking` - New session booked
- `payment_confirmed` - Payment confirmed
- `session_cancelled` - Session cancelled
- `session_rescheduled` - Session rescheduled
- `message` - New message received
- `system` - System notifications

### Priority Levels
- `high` - Important notifications (session bookings, cancellations)
- `medium` - Standard notifications (payments, reschedules)
- `low` - Informational notifications (system updates)

## Manual Notification Creation

```tsx
import { useNotifications } from './contexts/NotificationContext';

function MyComponent() {
  const { addNotification } = useNotifications();

  const createCustomNotification = () => {
    addNotification({
      type: 'system',
      title: 'Custom Notification',
      message: 'This is a custom notification',
      priority: 'medium',
      actionUrl: '/custom-action',
      actionLabel: 'View Details',
    });
  };

  return <button onClick={createCustomNotification}>Add Notification</button>;
}
```

## Connection Status Monitoring

```tsx
import { useWebSocket } from './hooks/useWebSocket';

function ConnectionStatus() {
  const { isConnected, connectionState, reconnectAttempts } = useWebSocket();

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-sm">{connectionState}</span>
      {reconnectAttempts > 0 && (
        <span className="text-xs text-gray-500">
          (Reconnecting: {reconnectAttempts})
        </span>
      )}
    </div>
  );
}
```

## Testing the Implementation

### Test with Example Component
```tsx
import WebSocketIntegrationExample from './examples/WebSocketIntegrationExample';

function TestPage() {
  return <WebSocketIntegrationExample />;
}
```

### Simulate Server Messages
You can test the notification system by simulating WebSocket messages:

```javascript
// In browser console
const ws = new WebSocket('ws://localhost:8080/ws');

// Simulate session booking
ws.send(JSON.stringify({
  type: 'session_booking',
  payload: {
    sessionId: 'test-123',
    sessionTitle: 'Test Session',
    mentorId: 'mentor-456',
    learnerId: 'learner-789'
  }
}));
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if WebSocket server is running on port 8080
   - Verify CORS settings on the server
   - Check firewall/network restrictions

2. **No Notifications**
   - Ensure NotificationProvider wraps your app
   - Check if WebSocket is connected
   - Verify message format matches expected schema

3. **Reconnection Issues**
   - Check maxReconnectAttempts configuration
   - Verify server is handling connection drops properly
   - Monitor browser console for error messages

### Debug Mode
Enable debug logging by checking the browser console for WebSocket events and notification state changes.

## Production Considerations

1. **WebSocket URL**: Update to your production WebSocket endpoint
2. **Authentication**: Ensure proper JWT token handling
3. **Error Handling**: Add comprehensive error logging
4. **Performance**: Monitor WebSocket connection health
5. **Security**: Validate all incoming messages on the server

## API Reference

### WebSocketService Methods
- `connect(token?: string)` - Connect to WebSocket server
- `disconnect()` - Close WebSocket connection
- `send(message)` - Send message to server
- `isConnected` - Connection status getter
- `connectionState` - Current connection state
- `getQueuedMessages()` - Get queued messages
- `clearMessageQueue()` - Clear message queue

### useWebSocket Hook Returns
- `socket` - WebSocket service instance
- `isConnected` - Boolean connection status
- `connectionState` - String connection state
- `reconnectAttempts` - Number of reconnection attempts
- `lastMessage` - Last received message
- `sendMessage()` - Send message function
- `connect()` - Manual connect function
- `disconnect()` - Manual disconnect function
- `queuedMessages` - Array of queued messages

### NotificationContext Methods
- `addNotification()` - Add new notification
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read
- `removeNotification(id)` - Remove notification
- `clearAll()` - Clear all notifications
- `processWebSocketMessage()` - Process WebSocket message
- `showToast()` - Show toast notification
- `setWebsocketStatus()` - Set WebSocket status

For more detailed examples and advanced usage, see the example files in the `src/examples/` directory.
