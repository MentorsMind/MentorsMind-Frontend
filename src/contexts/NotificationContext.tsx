import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { WebSocketMessage } from '../services/websocket.service';

export interface Notification {
  id: string;
  type: 'session_booking' | 'payment_confirmed' | 'session_cancelled' | 'session_rescheduled' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  websocketStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_WEBSOCKET_STATUS'; payload: 'connecting' | 'connected' | 'disconnected' | 'error' }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'INCREMENT_UNREAD' }
  | { type: 'RESET_UNREAD_COUNT' };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  websocketStatus: 'disconnected',
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };

      const updatedNotifications = [newNotification, ...state.notifications];
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: state.unreadCount + 1,
      };
    }

    case 'MARK_AS_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, read: true }
          : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount,
      };
    }

    case 'MARK_ALL_AS_READ': {
      const updatedNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    }

    case 'REMOVE_NOTIFICATION': {
      const updatedNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    }

    case 'SET_WEBSOCKET_STATUS': {
      return {
        ...state,
        websocketStatus: action.payload,
      };
    }

    case 'SET_CONNECTED': {
      return {
        ...state,
        isConnected: action.payload,
        websocketStatus: action.payload ? 'connected' : 'disconnected',
      };
    }

    case 'INCREMENT_UNREAD': {
      return {
        ...state,
        unreadCount: state.unreadCount + 1,
      };
    }

    case 'RESET_UNREAD_COUNT': {
      return {
        ...state,
        unreadCount: 0,
      };
    }

    default:
      return state;
  }
};

interface NotificationContextType extends NotificationState {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  processWebSocketMessage: (message: WebSocketMessage) => void;
  showToast: (notification: Notification) => void;
  setWebsocketStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  enableToasts?: boolean;
  enableSounds?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  enableToasts = true,
  enableSounds = false,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const showToast = useCallback((notification: Notification) => {
    if (!enableToasts) return;

    const toastConfig = {
      duration: notification.priority === 'high' ? 5000 : 4000,
      position: 'top-right' as const,
    };

    const toastMessage = (
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${
          notification.priority === 'high' ? 'bg-red-500' :
          notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`} />
        <div>
          <p className="font-semibold text-sm">{notification.title}</p>
          <p className="text-xs text-gray-600">{notification.message}</p>
        </div>
      </div>
    );

    toast.success(toastMessage, toastConfig);

    if (enableSounds) {
      playNotificationSound(notification.priority);
    }
  }, [enableToasts, enableSounds]);

  const processWebSocketMessage = useCallback((message: WebSocketMessage) => {
    let notification: Omit<Notification, 'id' | 'timestamp' | 'read'>;

    switch (message.type) {
      case 'session_booking':
        notification = {
          type: 'session_booking',
          title: 'New Session Booking',
          message: `You have a new session booking: ${message.payload.sessionTitle || 'Session scheduled'}`,
          priority: 'high',
          actionUrl: `/sessions/${message.payload.sessionId}`,
          actionLabel: 'View Session',
          metadata: message.payload,
        };
        break;

      case 'payment_confirmed':
        notification = {
          type: 'payment_confirmed',
          title: 'Payment Confirmed',
          message: `Payment of ${message.payload.amount || '0'} ${message.payload.currency || 'XLM'} has been confirmed`,
          priority: 'medium',
          actionUrl: `/payments/${message.payload.paymentId}`,
          actionLabel: 'View Payment',
          metadata: message.payload,
        };
        break;

      case 'session_cancelled':
        notification = {
          type: 'session_cancelled',
          title: 'Session Cancelled',
          message: `Session "${message.payload.sessionTitle || 'Untitled session'}" has been cancelled`,
          priority: 'high',
          actionUrl: `/sessions/${message.payload.sessionId}`,
          actionLabel: 'View Details',
          metadata: message.payload,
        };
        break;

      case 'session_rescheduled':
        notification = {
          type: 'session_rescheduled',
          title: 'Session Rescheduled',
          message: `Session "${message.payload.sessionTitle || 'Untitled session'}" has been rescheduled`,
          priority: 'medium',
          actionUrl: `/sessions/${message.payload.sessionId}`,
          actionLabel: 'View Details',
          metadata: message.payload,
        };
        break;

      case 'message':
        notification = {
          type: 'message',
          title: `New message from ${message.payload.senderName || 'Someone'}`,
          message: message.payload.content || 'You have a new message',
          priority: 'medium',
          actionUrl: `/messages/${message.payload.conversationId}`,
          actionLabel: 'View Message',
          metadata: message.payload,
        };
        break;

      default:
        notification = {
          type: 'system',
          title: 'System Update',
          message: message.payload.message || 'System notification',
          priority: 'low',
          metadata: message.payload,
        };
    }

    addNotification(notification);
  }, [addNotification]);

  const setWebsocketStatus = useCallback((status: 'connecting' | 'connected' | 'disconnected' | 'error') => {
    dispatch({ type: 'SET_WEBSOCKET_STATUS', payload: status });
  }, []);

  useEffect(() => {
    const latestNotification = state.notifications[0];
    if (latestNotification && !latestNotification.read) {
      showToast(latestNotification);
    }
  }, [state.notifications, showToast]);

  const contextValue: NotificationContextType = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    processWebSocketMessage,
    showToast,
    setWebsocketStatus,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

const playNotificationSound = (priority: 'low' | 'medium' | 'high') => {
  try {
    const audio = new Audio();
    
    switch (priority) {
      case 'high':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE';
        break;
      case 'medium':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE';
        break;
      case 'low':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE';
        break;
    }
    
    audio.volume = 0.3;
    audio.play().catch(() => {
    });
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
  }
};

export default NotificationContext;
