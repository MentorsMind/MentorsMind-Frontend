import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketService, WebSocketMessage, WebSocketConfig, getWebSocketService } from '../services/websocket.service';

interface UseWebSocketOptions extends Partial<WebSocketConfig> {
  autoConnect?: boolean;
  authToken?: string;
  onConnect?: () => void;
  onDisconnect?: (event: any) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: any) => void;
  onReconnect?: (attempt: number) => void;
}

interface UseWebSocketReturn {
  socket: WebSocketService | null;
  isConnected: boolean;
  connectionState: string;
  reconnectAttempts: number;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: Omit<WebSocketMessage, 'timestamp' | 'id'>) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  queuedMessages: WebSocketMessage[];
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    url = 'ws://localhost:8080/ws',
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 30000,
    autoConnect = true,
    authToken,
    onConnect,
    onDisconnect,
    onMessage,
    onError,
    onReconnect,
  } = options;

  const [socket, setSocket] = useState<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [queuedMessages, setQueuedMessages] = useState<WebSocketMessage[]>([]);

  const socketRef = useRef<WebSocketService | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const updateConnectionState = useCallback(() => {
    if (socketRef.current) {
      setIsConnected(socketRef.current.isConnected);
      setConnectionState(socketRef.current.connectionState);
      setQueuedMessages(socketRef.current.getQueuedMessages());
    }
  }, []);

  const connect = useCallback(async (): Promise<void> => {
    try {
      if (!socketRef.current) {
        const config: WebSocketConfig = {
          url,
          reconnectInterval,
          maxReconnectAttempts,
          heartbeatInterval,
        };
        
        socketRef.current = new WebSocketService(config);
        setSocket(socketRef.current);
      }

      await socketRef.current.connect(authToken);
      updateConnectionState();
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
  }, [url, reconnectInterval, maxReconnectAttempts, heartbeatInterval, authToken, updateConnectionState]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      updateConnectionState();
    }
  }, [updateConnectionState]);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp' | 'id'>) => {
    if (socketRef.current) {
      socketRef.current.send(message);
      updateConnectionState();
    }
  }, [updateConnectionState]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleOpen = () => {
      setIsConnected(true);
      setConnectionState('connected');
      setReconnectAttempts(0);
      onConnect?.();
      updateConnectionState();
    };

    const handleClose = (event: any) => {
      setIsConnected(false);
      setConnectionState('disconnected');
      onDisconnect?.(event);
      updateConnectionState();
    };

    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message);
      onMessage?.(message);
    };

    const handleError = (error: any) => {
      onError?.(error);
    };

    const handleReconnect = (attempt: number) => {
      setReconnectAttempts(attempt);
      onReconnect?.(attempt);
    };

    socketRef.current.onOpen(handleOpen);
    socketRef.current.onClose(handleClose);
    socketRef.current.onMessage(handleMessage);
    socketRef.current.onError(handleError);
    socketRef.current.onReconnect(handleReconnect);

    return () => {
      if (socketRef.current) {
        socketRef.current.onOpen(undefined);
        socketRef.current.onClose(undefined);
        socketRef.current.onMessage(undefined);
        socketRef.current.onError(undefined);
        socketRef.current.onReconnect(undefined);
      }
    };
  }, [onConnect, onDisconnect, onMessage, onError, onReconnect, updateConnectionState]);

  useEffect(() => {
    if (autoConnect && url) {
      connect().catch(console.error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [autoConnect, url, connect]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateConnectionState();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateConnectionState]);

  return {
    socket,
    isConnected,
    connectionState,
    reconnectAttempts,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    queuedMessages,
  };
};

export const useWebSocketGlobal = () => {
  const [globalSocket, setGlobalSocket] = useState<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const initializeGlobalSocket = useCallback((config: WebSocketConfig) => {
    const socket = getWebSocketService(config);
    setGlobalSocket(socket);

    socket.onOpen(() => {
      setIsConnected(true);
    });

    socket.onClose(() => {
      setIsConnected(false);
    });

    socket.onMessage((message) => {
      setLastMessage(message);
    });

    return socket;
  }, []);

  const sendGlobalMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp' | 'id'>) => {
    if (globalSocket) {
      globalSocket.send(message);
    }
  }, [globalSocket]);

  const disconnectGlobal = useCallback(() => {
    if (globalSocket) {
      globalSocket.disconnect();
      setGlobalSocket(null);
      setIsConnected(false);
    }
  }, [globalSocket]);

  return {
    globalSocket,
    isConnected,
    lastMessage,
    initializeGlobalSocket,
    sendGlobalMessage,
    disconnectGlobal,
  };
};
